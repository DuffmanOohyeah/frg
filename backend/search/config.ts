import { uuid } from 'uuidv4';

export interface Config {
    logLevel: string;
    requestIdentifier: string;
    dummyData: boolean;
    esEndpoint: string;
    ignoreExpiryDate: boolean;
    brand: string;
}

export interface Meta {
    field: string;
    startedAt: Date;
    args: unknown;
    requestIdentifier: string;
    dummyData: boolean;
}

export const getConfig = (): Config => {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const requestIdentifier = uuid();
    const dummyData = process.env.DUMMY_DATA === 'true';
    const brand = process.env.BRAND;
    const esEndpoint = process.env.ES_ENDPOINT || '';
    const ignoreExpiryDate = process.env.IGNORE_EXPIRY_DATE === 'true';
    if (!dummyData && !esEndpoint) {
        throw new Error('Missing config: ES_ENDPOINT not set');
    }
    if (!brand) {
        throw new Error('Missing config: BRAND not set');
    }

    return {
        logLevel,
        requestIdentifier,
        dummyData,
        esEndpoint,
        ignoreExpiryDate,
        brand,
    };
};
