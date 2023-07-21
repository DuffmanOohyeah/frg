import * as aws from 'aws-sdk';
import axios, { AxiosBasicCredentials, ResponseType } from 'axios';
import { prop } from 'ramda';

export const lambdaInvokePromise = async (lambda: aws.Lambda, functionName: string, payloadJson: string): Promise<string> => {
    return lambda
        .invoke({
            FunctionName: functionName,
            Payload: payloadJson,
        })
        .promise()
        .then((result: aws.Lambda.Types.InvocationResponse) => {
            if (result.FunctionError) {
                return Promise.reject({
                    msg: result.FunctionError,
                    payload: result.Payload,
                });
            } else if (typeof result.Payload === 'undefined') {
                return Promise.reject({
                    msg: 'No payload result',
                });
            } else {
                if (typeof result.Payload === 'string') {
                    return result.Payload;
                } else if (result.Payload instanceof Buffer || result.Payload instanceof Uint8Array) {
                    return Buffer.from(result.Payload).toString('utf8');
                }
                return Promise.reject({
                    msg: 'Unhandled response type',
                });
            }
        });
};

export const snsPublishPromise = async (sns: aws.SNS, topicArn: string, payloadJson: string): Promise<void> => {
    return sns
        .publish({
            Message: payloadJson,
            TopicArn: topicArn,
        })
        .promise()
        .then(() => {
            // Return nothing
        });
};

// NOTE: this currently does not stream a file from the source into
// s3, but rather loads it all into memory, then uploads it. Given the
// sizes of files this is likely to handle, this is probably OK.
export const copyImageToS3 = (s3: aws.S3, bucketName: string, auth: AxiosBasicCredentials | undefined, imageUrl: string, imageKey: string): Promise<boolean> => {
    const options = {
        responseType: 'arraybuffer' as ResponseType,
        auth,
    };
    return axios
        .get(encodeURI(imageUrl), options)
        .then(prop('data'))
        .then((body: Buffer) =>
            s3
                .putObject({
                    Body: body,
                    Key: imageKey,
                    Bucket: bucketName,
                })
                .promise(),
        )
        .then(() => true);
};
