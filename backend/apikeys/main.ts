import * as t from 'io-ts';
import * as winston from 'winston';
import { getConfig, Config } from './config';
import * as aws from 'aws-sdk';
import { handlerFactory } from '../shared/lambda-handler';

const setupLogging = (logLevel: string): void => {
    winston.configure({
        level: logLevel,
        transports: [new winston.transports.Console()],
    });
};

const InputEvent = t.type({});

type InputEvent = t.TypeOf<typeof InputEvent>;

interface Context {
    config: Config;
    appsync: aws.AppSync;
    startedAt: Date;
}

const GetApiKeyInput = t.type({});

type GetApiKeyInput = t.TypeOf<typeof GetApiKeyInput>;

interface ApiKey {
    apiKey: string;
    useUntil: string; // ISO datetime
}

const findSufficientlyValidApiKey = async (appsync: aws.AppSync, apiId: string, start: Date, minimumRemainingValiditySeconds: number, nextToken?: string): Promise<ApiKey | undefined> => {
    winston.debug('Listing API keys...');
    const keysResponse = await appsync
        .listApiKeys({
            apiId,
            ...(nextToken ? { nextToken } : {}),
            maxResults: 10,
        })
        .promise();
    const keys = keysResponse.apiKeys;

    if (typeof keys === 'undefined' || keys.length === 0) {
        return undefined;
    }

    winston.debug('Found API keys', { count: keys.length });

    const targetValidity = Math.round(start.getTime() / 1000) + minimumRemainingValiditySeconds;
    const sufficientlyValid = keys.find((key: aws.AppSync.ApiKey): boolean => !!key.expires && key.expires > targetValidity);
    if (sufficientlyValid && sufficientlyValid.id && sufficientlyValid.expires) {
        return {
            apiKey: sufficientlyValid.id,
            useUntil: new Date(Math.round((sufficientlyValid.expires - minimumRemainingValiditySeconds) * 1000)).toISOString(),
        };
    }

    if (keysResponse.nextToken) {
        return findSufficientlyValidApiKey(appsync, apiId, start, minimumRemainingValiditySeconds, keysResponse.nextToken);
    }
    return undefined;
};

const createNewApiKey = async (appsync: aws.AppSync, apiId: string, newApiKeyValiditySeconds: number, minimumRemainingValiditySeconds: number): Promise<ApiKey> => {
    const now = new Date();
    const newApiKeyResponse = await appsync
        .createApiKey({
            apiId,
            description: `Automatically generated at ${now.toISOString()}`,
            expires: Math.round(now.getTime() / 1000) + newApiKeyValiditySeconds,
        })
        .promise();
    const newApiKey = newApiKeyResponse.apiKey;
    if (typeof newApiKey === 'undefined') {
        return Promise.reject('Unable to create new API key');
    }
    if (!newApiKey.id || !newApiKey.expires) {
        return Promise.reject('Created API key missing expected data');
    }
    return {
        apiKey: newApiKey.id,
        useUntil: new Date((newApiKey.expires - minimumRemainingValiditySeconds) * 1000).toISOString(),
    };
};

export const handler = handlerFactory({
    resolvers: {
        getApiKey: {
            inputCodec: GetApiKeyInput,
            fn: async (input: GetApiKeyInput, ctx: Context): Promise<ApiKey> => {
                const apiKey = await findSufficientlyValidApiKey(ctx.appsync, ctx.config.appsyncApiId, ctx.startedAt, ctx.config.minimumRemainingValiditySeconds);

                if (typeof apiKey !== 'undefined') {
                    winston.debug('Found existing API key', { apiKey });
                    return apiKey;
                }

                const newApiKey = await createNewApiKey(ctx.appsync, ctx.config.appsyncApiId, ctx.config.newApiKeyValiditySeconds, ctx.config.minimumRemainingValiditySeconds);
                winston.info('Returning', { newApiKey });
                return newApiKey;
            },
        },
    },
    eventDecoder: InputEvent,
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    getContext: async (event: InputEvent): Promise<Context> => {
        let config = null;
        try {
            config = getConfig();
        } catch (err) {
            setupLogging('warn');
            winston.error('Missing config', { err });
            console.error(err);
            return Promise.reject('Improperly configured');
        }
        setupLogging(config.logLevel);
        winston.info('Starting');
        return Promise.resolve({
            config,
            startedAt: new Date(),
            appsync: new aws.AppSync({ region: config.awsRegion }),
        });
    },
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    getResolverName: (event: InputEvent): string => 'getApiKey',
});

module.exports = { handler };
