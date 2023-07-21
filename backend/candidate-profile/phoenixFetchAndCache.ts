import * as winston from 'winston';
import { isRight } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import * as aws from 'aws-sdk';
import { GetSkillsInput } from './inputTypes';
import { snsPublishPromise } from './awsUtils';
import { uuid } from 'uuidv4';
import { PhoenixActionConfig, Action } from './phoenix/actions/shared/common';
import { ListEmploymentPreferencesResponse, ListAccreditationsResponse, ListSkillsResponse } from './phoenix';

interface Config {
    s3: aws.S3;
    lambda: aws.Lambda;
    sns?: aws.SNS;
    bucketName: string;
    region: string;
    cacheTimeout: number;
    rerunSnsTopic?: string;
    logLevel: string;
    requestIdentifier: string;
    cacheVersion: string;
}

interface GetConfigProps {
    includeSns: boolean;
}

export const getPhoenixConfig = (props: GetConfigProps): Config => {
    const { includeSns } = props;
    const region = process.env.AWS_DEFAULT_REGION;
    const cacheTimeout = Number(process.env.CACHE_TIMEOUT);
    const rerunSnsTopic = process.env.RERUN_SNS_TOPIC;
    const bucketName = process.env.PHOENIX_CACHE_BUCKET;
    const logLevel = process.env.LOG_LEVEL || 'info';
    const requestIdentifier = uuid();
    const cacheVersion = process.env.CACHE_VERSION;

    if (!region) throw new Error('Improperly configured - no region');
    if (isNaN(cacheTimeout)) throw new Error('Improperly configured - no cache timeout');
    if (includeSns && !rerunSnsTopic) throw new Error('Improperly configured - no sns topic arn');
    if (!bucketName) throw new Error('Improperly configured - no PHOENIX_CACHE_BUCKET');
    if (!cacheVersion) throw new Error('Improperly configured - no cache version');

    return {
        s3: new aws.S3(),
        lambda: new aws.Lambda({
            region,
        }),
        sns: includeSns ? new aws.SNS({ region }) : undefined,
        region,
        cacheTimeout,
        rerunSnsTopic,
        bucketName,
        logLevel,
        requestIdentifier,
        cacheVersion,
    };
};

const FetcherResponse = t.union([ListSkillsResponse, ListAccreditationsResponse, ListEmploymentPreferencesResponse]);

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

interface FetcherPayload {
    config: PhoenixActionConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function: Action<any, any>;
    funtionName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any;
}

export const fetchFromSource = async (config: Config, payload: FetcherPayload): Promise<FetcherResponse> => {
    winston.info('Fetching from phoenix', { functionName: payload.funtionName, payload });
    const phoenixData = await payload.function(payload.config, payload.input);
    winston.info('Phoenix returned', { functionName: payload.funtionName, phoenixData });
    if (isRight(FetcherResponse.decode(phoenixData))) {
        return phoenixData;
    }
    winston.info('Response data is the wrong shape', { phoenixData });
    throw new Error('Response data is the wrong shape');
};
export const saveToCache = async (config: Config, cacheKey: string, sourceData: FetcherResponse): Promise<void> => {
    const params = {
        /* eslint-disable @typescript-eslint/naming-convention */
        Bucket: config.bucketName,
        Key: cacheKey,
        Metadata: {
            // This version represents the cache data structure version and not the content version
            cache_version: config.cacheVersion,
        },
        /* eslint-enable @typescript-eslint/naming-convention */
    };

    return config.s3
        .putObject({
            /* eslint-disable @typescript-eslint/naming-convention */
            ...params,
            Body: JSON.stringify(sourceData),
            /* eslint-enable @typescript-eslint/naming-convention */
        })
        .promise()
        .then(() => {
            // return nothing
        });
};

interface FetchAndCacheFromSourceProps {
    config: Config;
    fetcherPayload: FetcherPayload;
    cacheKey: string;
}
export const fetchAndCacheFromSource = async (props: FetchAndCacheFromSourceProps): Promise<FetcherResponse> => {
    const { config, fetcherPayload, cacheKey } = props;
    const data = await fetchFromSource(config, fetcherPayload);
    winston.debug('Got data, saving to cache');
    await saveToCache(config, cacheKey, data);
    winston.debug('Saved data to cache');
    return data;
};

const Input = t.union([GetSkillsInput, t.type({})]);

type Input = t.TypeOf<typeof Input>;

interface FetchAndCacheProps {
    config: Config;
    args: Input;
    fetcherPayload: FetcherPayload;
    cacheKey: string;
    forceFetch: boolean;
    fieldName: string;
    identity: string;
}

export const fetchAndCache = async (props: FetchAndCacheProps): Promise<FetcherResponse> => {
    const { config, args, fetcherPayload, cacheKey, forceFetch, fieldName, identity } = props;
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
                    identity,
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
