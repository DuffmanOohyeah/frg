export interface Config {
    logLevel: string;
    awsRegion: string;
    appsyncApiId: string;
    minimumRemainingValiditySeconds: number;
    newApiKeyValiditySeconds: number;
}

const getStringConfig = (envVar: string): string => {
    const value = process.env[envVar];
    if (!value) {
        throw new Error(`Missing config: ${envVar} not set`);
    }
    return value;
};

const getIntegerConfig = (envVar: string): number => {
    const stringValue = getStringConfig(envVar);
    const value = parseInt(stringValue, 10);
    if (isNaN(value)) {
        throw new Error(`Unable to parse value for ${envVar} as an integer`);
    }
    return value;
};

export const getConfig = (): Config => {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const appsyncApiId = getStringConfig('APPSYNC_API_ID');
    const awsRegion = getStringConfig('AWS_DEFAULT_REGION');
    const minimumRemainingValiditySeconds = getIntegerConfig('MINIMUM_REMAINING_VALIDITY_SECONDS');
    const newApiKeyValiditySeconds = getIntegerConfig('NEW_API_KEY_VALIDITITY_SECONDS');

    return {
        logLevel,
        appsyncApiId,
        awsRegion,
        minimumRemainingValiditySeconds,
        newApiKeyValiditySeconds,
    };
};
