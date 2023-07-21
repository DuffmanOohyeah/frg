import * as winston from 'winston';

export interface Config {
    logLevel: string;
    s3Bucket: string;
    brand: string;
    searchLambdaName: string;
    hostingDomain: string;
}

const getStringConfig = (envVar: string, defaultValue: undefined | string = undefined): string => {
    const value = process.env[envVar];
    if (!value) {
        if (typeof defaultValue !== 'undefined') {
            return defaultValue;
        }
        throw new Error(`Missing config: ${envVar} not set`);
    }
    return value;
};

export const getConfig = (): Config => {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const s3Bucket = getStringConfig('S3_BUCKET');
    const brand = getStringConfig('BRAND');
    const searchLambdaName = getStringConfig('SEARCH_LAMBDA_NAME');
    const hostingDomain = getStringConfig('HOSTING_DOMAIN');

    return {
        logLevel,
        s3Bucket,
        brand,
        searchLambdaName,
        hostingDomain,
    };
};

export const setupLogging = (logLevel: string): void => {
    winston.configure({
        level: logLevel,
        transports: [new winston.transports.Console()],
    });
};
