import * as winston from 'winston';
import { Meta, getConfig } from './config';
import { handlerFactory, optionalToUndefined } from '../shared/lambda-handler';
import * as t from 'io-ts';
import handlers from './handler';
import { isRight } from 'fp-ts/lib/Either';
import { tIdentity } from './Identity';
import { isCandidate } from './utils';

const InputEvent = t.type({
    field: t.string,
    args: t.unknown,
    identity: t.union([t.string, tIdentity, t.undefined]),
    fromSns: optionalToUndefined(t.boolean),
});
type InputEvent = t.TypeOf<typeof InputEvent>;

const setupLogging = (logLevel: string, meta: Meta): void => {
    winston.configure({
        level: logLevel,
        transports: [new winston.transports.Console()],
        defaultMeta: meta,
        exitOnError: false,
    });
};

export type HandlerContext = {
    name: string;
    brand: string;
    bucketName: string;
    daxtraURL: string;
    daxtraSecretArn: string;
    tableName: string;
    phoenixUrl: string;
    phoenixSecretArn: string;
    cacheTimeout: string;
    rerunSnsTopic: string;
    searchLambdaName?: string;
    sendJobApplicationFromAddress?: string;
    sendJobApplicationToAddress?: string;
    disableSendCvToPhoenix?: boolean;
};

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

const getEvent = (event: unknown): InputEvent => {
    const snsDecoded = SNSEvent.decode(event);
    if (isRight(snsDecoded)) {
        const snsEvent = event as SNSEvent;
        let message;
        try {
            message = JSON.parse(snsEvent.Records[0].Sns.Message);
        } catch (err) {
            throw new Error('Unable to parse JSON from SNS');
        }
        if (isRight(InputEvent.decode(message))) {
            return {
                ...(message as InputEvent),
                fromSns: true,
            };
        }
        winston.error('Unable to parse valid event from SNS');
        throw new Error('Unable to parse valid event from SNS');
    }
    const eventDecoded = InputEvent.decode(event);
    if (isRight(eventDecoded)) {
        return {
            ...(event as InputEvent),
        };
    }

    winston.error('Unable to parse event');
    throw new Error('Unable to parse event');
};

export const handler = (unhandledEvent: unknown): Promise<unknown> => {
    const event = getEvent(unhandledEvent);
    return handlerFactory({
        eventDecoder: InputEvent,
        getContext: async (event: InputEvent): Promise<HandlerContext> => {
            if (event.field !== 'getSignedUrlTemporary' && event.field !== 'parseCVTemporary') {
                if (!event.identity) throw new Error('No user identity in event');
                if (typeof event.identity !== 'string' && !isCandidate(event.identity)) {
                    throw new Error('User is not a candidate');
                }
            }
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
                ...config,
            });
        },
        getResolverName: (event: InputEvent): string => event.field,
        resolvers: handlers,
    })(event);
};

module.exports = { handler };
