import * as winston from 'winston';
import { handlers } from './handlers';
import { getSearchClient, SearchClient } from './client';
import { Meta, getConfig } from './config';
import { handlerFactory } from '../shared/lambda-handler';
import * as t from 'io-ts';

const SearchEvent = t.type({
    field: t.string,
    args: t.unknown,
});

type SearchEvent = t.TypeOf<typeof SearchEvent>;

export interface Context {
    name: string;
    searchClient: SearchClient;
    esEndpoint: string;
    ignoreExpiryDate: boolean;
    brand: string;
}

const setupLogging = (logLevel: string, meta: Meta): void => {
    winston.configure({
        level: logLevel,
        transports: [new winston.transports.Console()],
        defaultMeta: meta,
    });
};

export const handler = handlerFactory({
    eventDecoder: SearchEvent,
    getContext: async (event: SearchEvent): Promise<Context> => {
        const args = event.args;
        const field = event.field;
        const startedAt = new Date();

        const config = getConfig();
        setupLogging(config.logLevel, {
            field,
            startedAt,
            args,
            requestIdentifier: config.requestIdentifier,
            dummyData: config.dummyData,
        });
        winston.debug('Starting');
        return Promise.resolve({
            name: event.field,
            searchClient: getSearchClient(config.dummyData),
            esEndpoint: config.esEndpoint,
            ignoreExpiryDate: config.ignoreExpiryDate,
            brand: config.brand,
        });
    },
    getResolverName: (event: SearchEvent): string => event.field,
    resolvers: handlers,
});

module.exports = { handler };
