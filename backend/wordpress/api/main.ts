import * as aws from 'aws-sdk';
import { map, pick, pipe, over, lensPath, replace, find, propEq } from 'ramda';
import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { Promise as BluebirdPromise } from 'bluebird';
import * as winston from 'winston';
import { uuid } from 'uuidv4';

import { trimSlashes } from './utils';
import { lambdaInvokePromise, snsPublishPromise, copyImageToS3 } from './awsUtils';
import { AxiosBasicCredentials } from 'axios';

interface Config {
    s3: aws.S3;
    lambda: aws.Lambda;
    sns?: aws.SNS;
    fetcherLambda: string;
    bucketName: string;
    apiUrl: string;
    region: string;
    cacheTimeout: number;
    rerunSnsTopic?: string;
    logLevel: string;
    requestIdentifier: string;
    cacheVersion: string;
    auth: AxiosBasicCredentials | undefined;
}

interface Meta {
    field: string;
    startedAt: Date;
    args: Input;
    requestIdentifier: string;
}

const setupLogging = (logLevel: string, meta: Meta): void => {
    winston.configure({
        level: logLevel,
        transports: [new winston.transports.Console()],
        defaultMeta: meta,
    });
};

interface GetConfigProps {
    includeSns: boolean;
}

const getConfig = (props: GetConfigProps): Config => {
    const { includeSns } = props;
    const region = process.env.AWS_DEFAULT_REGION;
    const cacheTimeout = Number(process.env.CACHE_TIMEOUT);
    const rerunSnsTopic = process.env.RERUN_SNS_TOPIC;
    const bucketName = process.env.BUCKET_NAME;
    const fetcherLambda = process.env.FETCHER_LAMBDA;
    const apiUrl = process.env.API_URL;
    const logLevel = process.env.LOG_LEVEL || 'info';
    const requestIdentifier = uuid();
    const cacheVersion = process.env.CACHE_VERSION;
    const basicAuthUsername = process.env.HTTP_BASIC_AUTH_USERNAME;
    const basicAuthPassword = process.env.HTTP_BASIC_AUTH_PASSWORD;

    if (!region) throw new Error('Improperly configured - no region');
    if (isNaN(cacheTimeout)) throw new Error('Improperly configured - no cache timeout');
    if (includeSns && !rerunSnsTopic) throw new Error('Improperly configured - no sns topic arn');
    if (!bucketName) throw new Error('Improperly configured - no bucket name');
    if (!fetcherLambda) throw new Error('Improperly configured - no fetcher lambda');
    if (!apiUrl) throw new Error('Improperly configured - no API URL');
    if (!cacheVersion) throw new Error('Improperly configured - no cache version');
    if ((basicAuthUsername && !basicAuthPassword) || (!basicAuthUsername && basicAuthPassword)) throw new Error('Improperly configured - no cache version');

    const auth = basicAuthUsername && basicAuthPassword ? { username: basicAuthUsername, password: basicAuthPassword } : undefined;

    return {
        s3: new aws.S3(),
        lambda: new aws.Lambda({
            region,
        }),
        ...(includeSns ? { sns: new aws.SNS({ region }) } : {}),
        region,
        cacheTimeout,
        rerunSnsTopic,
        bucketName,
        fetcherLambda,
        apiUrl,
        logLevel,
        requestIdentifier,
        cacheVersion,
        auth,
    };
};

const PageFetcherImage = t.type({
    url: t.string,
    htmlSrc: t.string,
});

const PageFetcherResponse = t.type({
    bodyHtml: t.string,
    images: t.array(PageFetcherImage),
});
type PageFetcherResponse = t.TypeOf<typeof PageFetcherResponse>;

const BlogListFetcherResponse = t.type({
    pageList: t.array(
        t.type({
            title: t.string,
            excerptHtml: t.string,
            slug: t.string,
            file: t.string,
        }),
    ),
    pageTotals: t.type({
        postTotal: t.number,
        postPages: t.number,
    }),
    images: t.array(PageFetcherImage),
});
type BlogListFetcherResponse = t.TypeOf<typeof BlogListFetcherResponse>;

const BlogCategoryListFetcherResponse = t.array(
    t.type({
        name: t.string,
        slug: t.string,
        id: t.number,
    }),
);
type BlogCategoryListFetcherResponse = t.TypeOf<typeof BlogCategoryListFetcherResponse>;

const SitemapBlogListFetcherResponse = t.array(
    t.type({
        slug: t.string,
        modifiedGmt: t.string,
    }),
);
type SitemapBlogListFetcherResponse = t.TypeOf<typeof SitemapBlogListFetcherResponse>;

const FetcherResponseError = t.type({
    error: t.string,
});

const FetcherResponse = t.union([PageFetcherResponse, BlogListFetcherResponse, BlogCategoryListFetcherResponse, SitemapBlogListFetcherResponse, FetcherResponseError]);

type FetcherResponseError = t.TypeOf<typeof FetcherResponseError>;

const instanceOfFetcherError = (obj: FetcherResponse): obj is FetcherResponseError => {
    return !!(obj as FetcherResponseError).error;
};

type FetcherResponse = t.TypeOf<typeof FetcherResponse>;

enum FetchRequired {
    NoFetch = 'NoFetch',
    QueueFetch = 'QueueFetch',
    ForceFetch = 'ForceFetch',
}
interface GoodCacheResponse {
    data: FetcherResponse;
    fetchRequired: FetchRequired.NoFetch;
}
interface OldCacheResponse {
    data: FetcherResponse;
    fetchRequired: FetchRequired.QueueFetch;
}
interface BadCacheResponse {
    fetchRequired: FetchRequired.ForceFetch;
}
type FetchFromCacheResponse = GoodCacheResponse | OldCacheResponse | BadCacheResponse;

const fetchFromCache = async (config: Config, cacheKey: string): Promise<FetchFromCacheResponse> => {
    const params = {
        Bucket: config.bucketName,
        Key: cacheKey,
    };

    let s3Head = null;
    try {
        s3Head = await config.s3.headObject(params).promise();
    } catch (err) {
        return { fetchRequired: FetchRequired.ForceFetch };
    }

    const s3Data = await config.s3.getObject(params).promise();
    if (!s3Data.Body) {
        return { fetchRequired: FetchRequired.ForceFetch };
    }

    if (!s3Data.Metadata || (s3Data.Metadata && (!s3Data.Metadata.origin || s3Data.Metadata.origin !== config.apiUrl))) {
        winston.debug('Origin of data in cache does not match expected origin, will refetch', { metadata: s3Data.Metadata, apiUrl: config.apiUrl });
        return { fetchRequired: FetchRequired.ForceFetch };
    }

    if (!s3Data.Metadata || (s3Data.Metadata && (!s3Data.Metadata.cache_version || s3Data.Metadata.cache_version !== config.cacheVersion))) {
        winston.debug('Version of data in cache does not match expected version, will refetch', { metadata: s3Data.Metadata, cacheVersion: config.cacheVersion });
        return { fetchRequired: FetchRequired.ForceFetch };
    }

    const decodedData = JSON.parse(s3Data.Body.toString('utf-8'));
    if (!isRight(FetcherResponse.decode(decodedData))) {
        winston.info('Response data is the wrong shape', { cachedObject: decodedData });
        throw new Error('Response data is the wrong shape');
    }

    const fetchRequired = Date.now() - Number(s3Head.LastModified) > config.cacheTimeout;
    return {
        data: decodedData,
        fetchRequired: fetchRequired ? FetchRequired.QueueFetch : FetchRequired.NoFetch,
    };
};

const PageFetcherPayload = t.type({
    target: t.literal('page'),
    path: t.string,
});

const BlogListFetcherPayload = t.intersection([
    t.type({
        target: t.literal('bloglist'),
        page: t.number,
    }),
    t.partial({
        categoryId: t.number,
    }),
]);

const BlogCategoryListFetcherPayload = t.type({
    target: t.literal('category'),
    page: t.number,
});

const SitemapBlogListPayload = t.type({
    target: t.literal('sitemap_bloglist'),
    page: t.number,
});

type PageFetcherPayload = t.TypeOf<typeof PageFetcherPayload>;
type BlogListFetcherPayload = t.TypeOf<typeof BlogListFetcherPayload>;
type BlogCategoryListFetcherPayload = t.TypeOf<typeof BlogCategoryListFetcherPayload>;
type SitemapBlogListPayload = t.TypeOf<typeof SitemapBlogListPayload>;

const FetcherPayload = t.union([PageFetcherPayload, BlogListFetcherPayload, BlogCategoryListFetcherPayload, SitemapBlogListPayload]);

type FetcherPayload = t.TypeOf<typeof FetcherPayload>;

const GraphQLNullable = t.union([t.null, t.undefined]);

const BaseInput = t.partial({
    forceFetch: t.boolean,
});

const PageInput = t.intersection([
    t.type({
        path: t.string,
    }),
    t.partial({
        urlOverride: t.union([t.string, GraphQLNullable]),
    }),
    BaseInput,
]);

const BlogListInput = t.intersection([
    t.partial({
        page: t.union([t.number, GraphQLNullable]),
        category: t.union([t.string, GraphQLNullable]),
        urlOverride: t.union([t.string, GraphQLNullable]),
    }),
    BaseInput,
]);

const BlogCategoryListInput = BaseInput;
const SitemapBlogListInput = BaseInput;

type PageInput = t.TypeOf<typeof PageInput>;
type BlogListInput = t.TypeOf<typeof BlogListInput>;
type BlogCategoryListInput = t.TypeOf<typeof BlogCategoryListInput>;
type SitemapBlogListInput = t.TypeOf<typeof SitemapBlogListInput>;

const Input = t.union([PageInput, BlogListInput, BlogCategoryListInput]);

type Input = t.TypeOf<typeof Input>;

const fetchFromSource = async (config: Config, payload: FetcherPayload): Promise<FetcherResponse> => {
    const lambdaPayload = JSON.stringify(payload);
    winston.info('Invoking wordpress fetcher lambda', { functionName: config.fetcherLambda, payload });
    const lambdaData = await lambdaInvokePromise(config.lambda, config.fetcherLambda, lambdaPayload);
    winston.info('Wordpress fetcher lambda returned', { functionName: config.fetcherLambda });
    const lambdaObject = JSON.parse(lambdaData);
    if (isRight(FetcherResponse.decode(lambdaObject))) {
        winston.info('Wordpress fetcher data decoded', { functionName: config.fetcherLambda });
        return lambdaObject;
    }
    winston.error('Response data is the wrong shape', { lambdaObject });
    throw new Error('Response data is the wrong shape');
};

interface Image {
    url: string;
    htmlSrc: string;
}

const saveToCache = async (config: Config, cacheKey: string, sourceData: FetcherResponse): Promise<void> => {
    const params = {
        Bucket: config.bucketName,
        Key: cacheKey,
        Metadata: {
            /* eslint-disable @typescript-eslint/naming-convention */
            // This version represents the cache data structure version and not the content version
            cache_version: config.cacheVersion,
            // Represents the api the content originated from
            origin: config.apiUrl,
            /* eslint-enable @typescript-eslint/naming-convention */
        },
    };

    return BluebirdPromise.props({
        sourceBody: config.s3
            .putObject({
                ...params,
                Body: JSON.stringify(sourceData),
            })
            .promise(),
        images: Promise.all(
            map((image: Image) => {
                const imagePath = image.htmlSrc.replace('$$DOMAIN$$/', '');
                const imageKey = `images/${imagePath}`;
                return copyImageToS3(config.s3, config.bucketName, config.auth, image.url, imageKey);
            }, (sourceData as BlogListFetcherResponse).images || []),
        ),
    }).then(() => {
        // return nothing
    });
};

interface FetchAndCacheFromSourceProps {
    config: Config;
    fetcherPayload: FetcherPayload;
    cacheKey: string;
}
const fetchAndCacheFromSource = async (props: FetchAndCacheFromSourceProps): Promise<FetcherResponse> => {
    const { config, fetcherPayload, cacheKey } = props;
    if (!isRight(FetcherPayload.decode(fetcherPayload))) {
        winston.info('Payload data is the wrong shape', { fetcherPayload });
        throw new Error('Payload data is the wrong shape');
    }

    const data = await fetchFromSource(config, fetcherPayload);
    if (instanceOfFetcherError(data)) {
        if (data.error === 'rest_post_invalid_page_number') {
            winston.info('Error, page not found');
            throw new Error('Page number not found');
        } else {
            winston.error('Unknown error', { data });
            throw new Error('Unclassified error');
        }
    }
    winston.debug('Got data, saving to cache');
    await saveToCache(config, cacheKey, data);
    winston.debug('Saved data to cache');
    return data;
};

interface FetchAndCacheProps {
    config: Config;
    args: Input;
    fetcherPayload: FetcherPayload;
    cacheKey: string;
    forceFetch: boolean;
    fieldName: string;
}

const fetchAndCache = async (props: FetchAndCacheProps): Promise<FetcherResponse> => {
    const { config, args, fetcherPayload, cacheKey, forceFetch, fieldName } = props;
    if (forceFetch) {
        winston.debug('Forcing fetch');
        const data = await fetchAndCacheFromSource({ config, fetcherPayload, cacheKey });
        winston.debug('Returning data');
        return data;
    } else {
        const cacheResponse = await fetchFromCache(config, cacheKey);

        switch (cacheResponse.fetchRequired) {
            case FetchRequired.ForceFetch:
                winston.debug('Fetch and cache from source');
                const data = await fetchAndCacheFromSource({ config, fetcherPayload, cacheKey });
                winston.debug('Returning new data');
                return data;
            case FetchRequired.QueueFetch:
                winston.debug('Found data, but old. Will return, but trigger a fetch');
                const publishPayload = JSON.stringify({
                    args: { ...args, forceFetch: true },
                    field: fieldName,
                });
                winston.debug('Triggering async fetching');
                if (!config.sns || !config.rerunSnsTopic) {
                    throw new Error('Tried to call SNS when SNS was disabled - possible runaway averted.');
                }
                await snsPublishPromise(config.sns, config.rerunSnsTopic, publishPayload);
                winston.debug('Returning old data, refetch queued');
                return cacheResponse.data;
            case FetchRequired.NoFetch:
                winston.debug('Returning data');
                return cacheResponse.data;
        }
    }
};

const handlePage = async (config: Config, path: string, forceFetch = false): Promise<PageFetcherResponse> => {
    return fetchAndCache({
        config,
        args: { path },
        fetcherPayload: { target: 'page', path },
        cacheKey: `pages/${path}.json`,
        forceFetch,
        fieldName: 'getContentPage',
    }) as Promise<PageFetcherResponse>;
};

const handleBlogCategoryList = async (config: Config, page: number, forceFetch = false): Promise<BlogCategoryListFetcherResponse> => {
    return fetchAndCache({
        config,
        args: { page },
        fetcherPayload: { target: 'category', page },
        cacheKey: `category/${page}.json`,
        forceFetch,
        fieldName: 'getBlogCategoryList',
    }) as Promise<BlogCategoryListFetcherResponse>;
};

const handleSitemapBlogList = async (config: Config, page: number, forceFetch = false): Promise<SitemapBlogListFetcherResponse> => {
    return fetchAndCache({
        config,
        args: { page },
        fetcherPayload: { target: 'sitemap_bloglist', page },
        cacheKey: `sitemap/${page}.json`,
        forceFetch,
        fieldName: 'getSitemapBlogList',
    }) as Promise<SitemapBlogListFetcherResponse>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllCategories = async (config: Config, forceFetch = false, lastResult: any = undefined, categoryList: any = [], index = 1): Promise<BlogCategoryListFetcherResponse> => {
    if (lastResult) if (lastResult.length === 0) return categoryList;
    return handleBlogCategoryList(config, index, forceFetch)
        .then(categoryListData => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            categoryListData.forEach((category: any) => {
                categoryList.push(category);
            });
            return getAllCategories(config, forceFetch, categoryListData, categoryList, index + 1);
        })
        .catch(() => {
            return categoryList;
        });
};

const getCategoryKey = async (config: Config, category: string | undefined): Promise<number | undefined> => {
    //fetch list of categories from source/cache
    //map array of strings to objects that have a id and slug
    if (typeof category === 'undefined') {
        return undefined;
    }
    const allCategories = await getAllCategories(config);
    const matchingCategory = find(propEq('slug', category), allCategories);
    if (typeof matchingCategory === 'undefined') {
        return undefined;
    }
    return matchingCategory.id;
};

const handleBlogList = async (config: Config, page: number, forceFetch = false, category: string | undefined): Promise<BlogListFetcherResponse> => {
    // if it has a category slug, fetch all the categories and replace it with its id
    const categoryId = await getCategoryKey(config, category);
    return fetchAndCache({
        config,
        args: { page, category },
        fetcherPayload: { target: 'bloglist', page, categoryId },
        cacheKey: `list/${category ? category + '/' : ''}${page}.json`,
        forceFetch,
        fieldName: 'getBlogList',
    }) as Promise<BlogListFetcherResponse>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSitemapBlogList = async (config: Config, forceFetch = false, lastResult: any = undefined, postList: any = [], index = 1): Promise<SitemapBlogListFetcherResponse> => {
    if (lastResult) if (lastResult.length === 0) return postList;
    return handleSitemapBlogList(config, index, forceFetch)
        .then(postListData => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            postListData.forEach((postDetails: any) => {
                postList.push(postDetails);
            });
            return getSitemapBlogList(config, forceFetch, postListData, postList, index + 1);
        })
        .catch(() => {
            return postList;
        });
};

interface Handler<R extends FetcherResponse> {
    fn: (config: Config, args: Input) => Promise<R>;
    after: (response: R, args: Input) => Output;
}

type Handlers = Record<string, Handler<FetcherResponse>>;

const domainReplacement = (urlOverride: string | undefined | null): string => {
    if (!urlOverride) {
        return '/images';
    }
    return trimSlashes(urlOverride);
};

const handlers = {
    getBlogCategoryList: {
        fn: (config: Config, args: BlogCategoryListInput): Promise<BlogCategoryListFetcherResponse> => getAllCategories(config, args.forceFetch),
        after: (response: BlogCategoryListFetcherResponse): Output => map(pick(['name', 'slug', 'id', 'count']), response),
    } as Handler<BlogCategoryListFetcherResponse>,
    getBlogList: {
        fn: (config: Config, args: BlogListInput): Promise<BlogListFetcherResponse> => handleBlogList(config, args.page || 1, args.forceFetch, args.category || undefined),
        after: (response: BlogListFetcherResponse, args: BlogListInput): BlogListOutput => {
            // TODO: worry about the error handling here
            return pipe(
                pick(['pageList', 'pageTotals']),
                over(lensPath(['pageList']), map(pipe(pick(['title', 'slug', 'excerptHtml', 'file']), over(lensPath(['file']), replace(/\$\$DOMAIN\$\$/g, domainReplacement(args.urlOverride)))))),
            )(response);
        },
    } as Handler<BlogListFetcherResponse>,
    getContentPage: {
        fn: (config: Config, args: PageInput): Promise<PageFetcherResponse> => handlePage(config, trimSlashes(args.path), args.forceFetch),
        after: (response: PageFetcherResponse, args: PageInput): WebpageOutput =>
            pipe(
                pick(['bodyHtml', 'title', 'author', 'categories', 'excerptHtml', 'publishedGmt', 'modifiedGmt', 'slug']),
                over(lensPath(['bodyHtml']), replace(/\$\$DOMAIN\$\$/g, domainReplacement(args.urlOverride))),
            )(response),
    } as Handler<PageFetcherResponse>,
    getSitemapBlogList: {
        fn: (config: Config, args: SitemapBlogListInput): Promise<SitemapBlogListFetcherResponse> => getSitemapBlogList(config, args.forceFetch),
        after: (response: SitemapBlogListFetcherResponse): SitemapBlogListOutput => map(pick(['slug', 'modifiedGmt']), response),
    } as Handler<SitemapBlogListFetcherResponse>,
} as Handlers;

const PageEvent = t.type({
    field: t.literal('getContentPage'),
    args: PageInput,
});

const BlogListEvent = t.type({
    field: t.literal('getBlogList'),
    args: BlogListInput,
});

const BlogCategoryListEvent = t.type({
    field: t.literal('getBlogCategoryList'),
    args: BlogCategoryListInput,
});

const SitemapBlogListEvent = t.type({
    field: t.literal('getSitemapBlogList'),
    args: SitemapBlogListInput,
});

const Event = t.union([PageEvent, BlogListEvent, BlogCategoryListEvent, SitemapBlogListEvent]);

type Event = t.TypeOf<typeof Event>;

const SNSEvent = t.type({
    Records: t.array(
        t.type({
            Sns: t.type({
                Message: t.string,
            }),
        }),
    ),
});

type SNSEvent = t.TypeOf<typeof SNSEvent>;

interface EventWithSource {
    event: Event;
    fromSns: boolean;
}

const getEvent = (event: unknown): EventWithSource => {
    const snsDecoded = SNSEvent.decode(event);
    if (isRight(snsDecoded)) {
        const snsEvent = event as SNSEvent;
        let message;
        try {
            message = JSON.parse(snsEvent.Records[0].Sns.Message);
        } catch (err) {
            throw new Error('Unable to parse JSON from SNS');
        }
        if (isRight(Event.decode(message))) {
            return {
                event: message as Event,
                fromSns: true,
            };
        }

        winston.error('Unable to parse valid event from SNS');
        throw new Error('Unable to parse valid event from SNS');
    }
    const eventDecoded = Event.decode(event);
    if (isRight(eventDecoded)) {
        return {
            event: event as Event,
            fromSns: false,
        };
    }

    console.log(JSON.stringify(event, null, 2));
    winston.error('Unable to parse event');
    throw new Error('Unable to parse event');
};

const WebpageOutput = t.type({
    bodyHtml: t.string,
});
type WebpageOutput = t.TypeOf<typeof WebpageOutput>;

const BlogListOutput = t.type({
    pageList: t.array(
        t.type({
            slug: t.string,
            title: t.string,
            excerptHtml: t.string,
            file: t.string,
        }),
    ),
    pageTotals: t.type({
        postTotal: t.number,
        postPages: t.number,
    }),
});
type BlogListOutput = t.TypeOf<typeof BlogListOutput>;

const CategoryListOutput = t.array(
    t.type({
        slug: t.string,
        name: t.string,
        id: t.number,
    }),
);
type CategoryListOutput = t.TypeOf<typeof CategoryListOutput>;

const SitemapBlogListOutput = t.array(
    t.type({
        slug: t.string,
        modifiedGmt: t.string,
    }),
);
type SitemapBlogListOutput = t.TypeOf<typeof SitemapBlogListOutput>;

const Output = t.union([WebpageOutput, BlogListOutput, CategoryListOutput, SitemapBlogListOutput]);

type Output = t.TypeOf<typeof Output>;

const handlerInner = async (eventWithSource: EventWithSource): Promise<Output> => {
    const startedAt = new Date();

    const event = eventWithSource.event;
    const args = event.args;
    const field = event.field;

    let config = null;
    try {
        config = getConfig({
            // If the request came from SNS, do not include the SNS details in the configuration
            includeSns: !eventWithSource.fromSns,
        });
    } catch (err) {
        return Promise.reject({
            msg: 'Improperly configured',
        });
    }
    setupLogging(config.logLevel, {
        field,
        startedAt,
        args,
        requestIdentifier: config.requestIdentifier,
    });
    winston.info('Starting');

    const foundHandler = handlers[field];

    if (!foundHandler) {
        winston.warn(`Unknown field ${field}`, { unknownField: field });
        throw new Error(`Unknown field ${field}`);
    }

    const response = await foundHandler.fn(config, args);
    winston.debug('Got response');
    const postProcessedResponse = foundHandler.after(response, args);
    winston.debug('Post-processed response');
    if (!isRight(Output.decode(postProcessedResponse))) {
        console.log(JSON.stringify(postProcessedResponse, null, 2));
        throw new Error('Output is the wrong shape');
    }
    return postProcessedResponse;
};

export const handler = async (inputEvent: unknown): Promise<Output | null> => {
    const event = getEvent(inputEvent);
    try {
        const result = await handlerInner(event);
        return result;
    } catch (err) {
        console.error(err);
        return null;
    }
};

module.exports = { handler };
