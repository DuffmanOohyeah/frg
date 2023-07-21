import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3notifications from '@aws-cdk/aws-s3-notifications';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import { DynamoDB } from './dynamodb';
import { UserPool } from '@aws-cdk/aws-cognito';

interface DeliveriesProps {
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly dynamoDB: DynamoDB;
    readonly userPool: UserPool;
    readonly cvBucket: s3.Bucket;
}

export default class Deliveries extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: DeliveriesProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'Deliveries');

        const bucket = new s3.Bucket(this, 'DeliveriesStorage', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: props.removalPolicy,
        });
        const rtbfUser = new iam.User(this, 'RTBFDeliveries');
        bucket.grantReadWrite(rtbfUser, 'GDPR/RTBF/*');
        bucket.grantReadWrite(rtbfUser, 'GDPR/UNSUB/*');
        bucket.grantReadWrite(rtbfUser, 'GDPR/REPORTS/*');

        const processRtbfUnsubscribeRequests = new nodeJsLambda.NodejsFunction(this, 'ProcessRtbfUnsubscribeRequests', {
            entry: './backend/process-rtbf-unsubscribe-requests/lamda/handler.ts',
            handler: 'eventHandler',
            depsLockFilePath: './backend/package-lock.json',
            environment: {
                LOG_LEVEL: 'warn',
                TABLE_NAME: props.dynamoDB.userStateTable.tableName,
                USER_POOL: props.userPool.userPoolId,
                S3_PREFIX: 'GDPR/RTBF',
                S3_BUCKET_DELIVERIES: bucket.bucketName,
                S3_BUCKET_CVSTORAGE: props.cvBucket.bucketName,
            },
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.minutes(15),
            memorySize: 10240,
        });

        processRtbfUnsubscribeRequests.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['cognito-idp:AdminDeleteUser', 'cognito-idp:ListUsers'],
                effect: iam.Effect.ALLOW,
                resources: [props.userPool.userPoolArn],
            }),
        );

        props.cvBucket.grantReadWrite(processRtbfUnsubscribeRequests);
        props.dynamoDB.userStateTable.grantReadWriteData(processRtbfUnsubscribeRequests);

        bucket.grantReadWrite(processRtbfUnsubscribeRequests, 'GDPR/RTBF/*');
        bucket.grantReadWrite(processRtbfUnsubscribeRequests, 'GDPR/REPORTS/*');
        bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3notifications.LambdaDestination(processRtbfUnsubscribeRequests), {
            prefix: 'GDPR/RTBF/',
        });
    }
}
