import { uuid } from 'uuidv4';
import * as winston from 'winston';

export interface Config {
    logLevel: string;
    requestIdentifier: string;
    tableName: string;
}

export interface Meta {
    field: string;
    startedAt: Date;
    requestIdentifier: string;
}

export const getConfig = (): Config => {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const requestIdentifier = uuid();
    const tableName = process.env.DYNAMODB_TABLE_NAME;
    if (!tableName) {
        winston.error('DYNAMODB_TABLE_NAME is undefined');
        throw new Error('Missing config');
    }
    return {
        logLevel,
        requestIdentifier,
        tableName,
    };
};
