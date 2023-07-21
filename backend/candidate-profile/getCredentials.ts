import * as AWS from 'aws-sdk';
import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';

const DaxtraCredentials = t.type({
    daxtraUsername: t.string,
    daxtraPassword: t.string,
});

export type DaxtraCredentials = t.TypeOf<typeof DaxtraCredentials>;

export const getCredentials = async (secretArn: string): Promise<DaxtraCredentials> => {
    const secretsManager = new AWS.SecretsManager();
    const secretsResponse = await secretsManager
        .getSecretValue({
            SecretId: secretArn,
        })
        .promise();
    const secretsRawData = secretsResponse.SecretString;

    if (typeof secretsRawData === 'undefined') throw new Error('Failed to load credentials configuration, missing JSON data');

    let secretsJson: unknown;
    try {
        secretsJson = JSON.parse(secretsRawData);
    } catch (err) {
        throw new Error('Failed to load credentials configuration, malformed JSON data');
    }

    const isCredentials = DaxtraCredentials.decode(secretsJson);
    if (isLeft(isCredentials)) throw new Error('Failed to load credentials configuration, invalid JSON data');

    const credentials = isCredentials.right;
    return credentials;
};
