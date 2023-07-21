import * as AWS from 'aws-sdk';
import { always, cond, equals, head, join, last, map, pick, pipe, replace, split, toLower, trim } from 'ramda';
import * as winston from 'winston';
import { Config } from './config';
import moment from 'moment';

interface SearchLocation {
    description: string;
    country: string;
    region: string;
}
interface SearchJobSalary {
    from?: number;
    to?: number;
    currency: string;
    description: string;
}
interface IndeedSitemapJob {
    lastModified: string;
    title: string;
    reference: string;
    location: SearchLocation;
    description: string;
    salary: SearchJobSalary;
    type: 'Contract' | 'Permanent';
}
const formatJobTitleForUrl = (title: string): string => pipe(replace(/\s+/g, '-'), replace(/-+/g, '-'), replace(/\//g, '-'), replace(/[^a-zA-Z\d\+\-]/g, ''), toLower)(title);

const getBrandPublisherTags = (brand: string, host: string): string =>
    cond<string, string>([
        [
            equals('Anderson'),
            always(`<publisher>Anderson Frank</publisher>
            <publisherurl>https://${host}</publisherurl>`),
        ],
        [
            equals('Mason'),
            always(`<publisher>Mason Frank</publisher>
            <publisherurl>https://${host}</publisherurl>`),
        ],
        [
            equals('Nelson'),
            always(`<publisher>Nelson Frank</publisher>
            <publisherurl>https://${host}</publisherurl>`),
        ],
        [
            equals('Nigel'),
            always(`<publisher>Nigel Frank</publisher>
            <publisherurl>https://${host}</publisherurl>`),
        ],
        [
            equals('Jefferson'),
            always(
                `<publisher>Jefferson Frank</publisher>
            <publisherurl>https://${host}</publisherurl>`,
            ),
        ],
        [
            equals('Washington'),
            always(`<publisher>Washington Frank</publisher>
            <publisherurl>https://${host}</publisherurl>`),
        ],
        [
            equals('FrgTech'),
            always(`<publisher>FrgTech</publisher>
            <publisherurl>https://${host}</publisherurl>`),
        ],
    ])(brand);

const makeIndeedSitemapXml = (tags: string[]): string => join('\n', ['<source>', ...tags, '</source>']);

// There is no "City" field in the location data we get for a job so we guess at what the city is by
// chopping up the location description value.
// For Nigel the city seems to be the first part eg "London, England"
// For all other brands this seems to be the last part eg "England, London"
// There is a chance the location description does not include a city at all and we will just return whatever eg "Lincolnshire, England"
const getCity = (brand: string, locationDescription: string) => {
    const splitDescription = split(',', locationDescription);
    if (brand === 'Nigel') {
        return trim(head(splitDescription) || '');
    }
    return trim(last(splitDescription) || '');
};

const jobTypeToIndeedJobTypeMap = {
    Contract: 'contract',
    Permanent: 'permanent',
};
const makeIndeedSitemapJobTag = (brand: string, job: IndeedSitemapJob, path: string): string => `<job>
<title>
<![CDATA[ ${job.title} ]]>
</title>
<date>
<![CDATA[ ${moment(job.lastModified).format('ddd, DD MMM YYYY')} GMT ]]>
</date>
<referencenumber>
<![CDATA[ ${job.reference} ]]>
</referencenumber>
<url>
<![CDATA[ /job${path} ]]>
</url>
<city>
<![CDATA[ ${getCity(brand, job.location.description)} ]]>
</city>
<country>
<![CDATA[ ${job.location.country} ]]>
</country>
<description>
<![CDATA[ ${job.description} ]]>
</description>
<salary>
<![CDATA[ ${job.salary.description} ]]>
</salary>
<jobtype>
<![CDATA[ ${jobTypeToIndeedJobTypeMap[job.type]} ]]>
</jobtype>
</job>`;

export const handler = async (config: Config): Promise<void> => {
    const s3 = new AWS.S3();
    const lambda = new AWS.Lambda();

    let allJobsForSitemap: IndeedSitemapJob[] = [];
    let nextBatchKey;

    do {
        const jobBatch = await lambda
            .invoke({
                FunctionName: config.searchLambdaName,
                Payload: JSON.stringify({
                    field: 'getAllJobsForIndeedSitemap',
                    args: {
                        lastSearchJob: nextBatchKey,
                    },
                }),
            })
            .promise();

        const parsedJobBatch = JSON.parse(jobBatch?.Payload?.toString() || '');
        winston.info('Job results parsed', { job: parsedJobBatch });

        if (parsedJobBatch.length) {
            allJobsForSitemap = [...allJobsForSitemap, ...parsedJobBatch];
            nextBatchKey = pick(['lastModified', 'reference'], last(allJobsForSitemap) || {});
        } else {
            nextBatchKey = undefined;
        }
    } while (nextBatchKey);
    winston.info('all job results parsed');

    const xml = makeIndeedSitemapXml([
        getBrandPublisherTags(config.brand, config.hostingDomain),
        ...map(job => makeIndeedSitemapJobTag(config.brand, job, `/${encodeURIComponent(job.reference)}/${formatJobTitleForUrl(job.title)}`), allJobsForSitemap),
    ]);

    // store in s3
    winston.info('storing in s3');

    await s3
        .putObject({
            Bucket: config.s3Bucket,
            Key: 'indeed',
            Body: xml,
            ContentType: 'text/xml',
        })
        .promise();
};
