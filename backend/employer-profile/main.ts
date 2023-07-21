import * as winston from 'winston';
import { Meta, getConfig } from './config';
import { handlerFactory } from '../shared/lambda-handler';
import * as t from 'io-ts';
import handlers from './handler';

const InputEvent = t.type({
    field: t.string,
    args: t.unknown,
    identity: t.unknown,
});

type InputEvent = t.TypeOf<typeof InputEvent>;

const setupLogging = (logLevel: string, meta: Meta): void => {
    winston.configure({
        level: logLevel,
        transports: [new winston.transports.Console()],
        defaultMeta: meta,
    });
};

export type HandlerContext = {
    name: string;
    tableName: string;
};

export const handler = (event: InputEvent): Promise<unknown> => {
    return handlerFactory({
        eventDecoder: InputEvent,
        getContext: async (event: InputEvent): Promise<HandlerContext> => {
            if (!event.identity) throw 'no user identity';
            const field = event.field;
            const startedAt = new Date();
            const config = getConfig();
            setupLogging(config.logLevel, {
                field,
                startedAt,
                requestIdentifier: config.requestIdentifier,
            });
            winston.info('Starting');
            return Promise.resolve({
                name: field,
                tableName: config.tableName,
            });
        },
        getResolverName: (event: InputEvent): string => event.field,
        resolvers: handlers,
    })(event);
};

module.exports = { handler };
