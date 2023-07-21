import { uuid } from 'uuidv4';
import * as winston from 'winston';

export interface Config {
    logLevel: string;
    requestIdentifier: string;
    brand: string;
    bucketName: string;
    daxtraURL: string;
    daxtraSecretArn: string;
    tableName: string;
    phoenixSecretArn: string;
    phoenixUrl: string;
    cacheTimeout: string;
    rerunSnsTopic: string;
    searchLambdaName?: string;
    sendJobApplicationFromAddress?: string;
    sendJobApplicationToAddress?: string;
    disableSendCvToPhoenix?: boolean;
}

export interface Meta {
    field: string;
    startedAt: Date;
    requestIdentifier: string;
}

export const getConfig = (): Config => {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const requestIdentifier = uuid();
    const brand = process.env.BRAND;
    const bucketName = process.env.BUCKET_NAME;
    const daxtraURL = process.env.DAXTRA_URL;
    const daxtraSecretArn = process.env.DAXTRA_CREDENTIALS_SECRET_ARN;
    const tableName = process.env.DYNAMODB_TABLE_NAME;
    const phoenixSecretArn = process.env.PHOENIX_CREDENTIALS_SECRET_ARN;
    const phoenixUrl = process.env.PHOENIX_URL;
    const cacheTimeout = process.env.CACHE_TIMEOUT;
    const rerunSnsTopic = process.env.RERUN_SNS_TOPIC;
    const searchLambdaName = process.env.SEARCH_LAMBDA_NAME;
    const sendJobApplicationFromAddress = process.env.SEND_JOB_APPLICATION_FROM;
    const sendJobApplicationToAddress = process.env.SEND_JOB_APPLICATION_TO;
    const disableSendCvToPhoenix = process.env.DISABLE_SEND_CV_TO_PHOENIX;

    if (!bucketName) {
        winston.error('BUCKET_NAME is undefined');
        throw new Error('Missing config');
    }
    if (!brand) {
        winston.error('BRAND is undefined');
        throw new Error('Missing config');
    }
    if (!daxtraURL) {
        winston.error('DAXTRA_URL is undefined');
        throw new Error('Missing config');
    }
    if (!daxtraSecretArn) {
        winston.error('DAXTRA_CREDENTIALS_SECRET_ARN is undefined');
        throw new Error('Missing config');
    }
    if (!tableName) {
        winston.error('DYNAMODB_TABLE_NAME is undefined');
        throw new Error('Missing config');
    }
    if (!phoenixSecretArn) {
        winston.error('PHOENIX_CREDENTIALS_SECRET_ARN is undefined');
        throw new Error('Missing config');
    }
    if (!phoenixUrl) {
        winston.error('PHOENIX_URL is undefined');
        throw new Error('Missing config');
    }
    if (!cacheTimeout) {
        winston.error('CACHE_TIMEOUT is undefined');
        throw new Error('Missing config');
    }
    if (!rerunSnsTopic) {
        winston.error('RERUN_SNS_TOPIC is undefined');
        throw new Error('Missing config');
    }

    if (sendJobApplicationFromAddress && !searchLambdaName) {
        winston.error('If SEND_JOB_APPLICATION_FROM is defined then SEARCH_LAMBDA_NAME cannot be undefined');
        throw new Error('Missing config');
    }

    return {
        logLevel,
        requestIdentifier,
        brand,
        bucketName,
        daxtraURL,
        daxtraSecretArn,
        tableName,
        phoenixSecretArn,
        phoenixUrl,
        cacheTimeout,
        rerunSnsTopic,
        searchLambdaName,
        sendJobApplicationFromAddress,
        sendJobApplicationToAddress,
        disableSendCvToPhoenix: !!disableSendCvToPhoenix,
    };
};
