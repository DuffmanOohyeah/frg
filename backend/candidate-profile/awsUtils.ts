import * as aws from 'aws-sdk';

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
