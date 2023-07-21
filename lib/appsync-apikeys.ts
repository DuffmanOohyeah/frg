import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';

interface AppSyncApiKeysProps {
    readonly apiId: string;
    readonly apiArn: string;
}

export default class AppSyncApiKeys extends cdk.Construct {
    readonly lambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: AppSyncApiKeysProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'AppsyncAPIKeys');

        const getter = new nodeJsLambda.NodejsFunction(this, 'Getter', {
            entry: './backend/apikeys/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'warn',
                APPSYNC_API_ID: props.apiId,
                MINIMUM_REMAINING_VALIDITY_SECONDS: String(cdk.Duration.days(2).toSeconds()),
                NEW_API_KEY_VALIDITITY_SECONDS: String(cdk.Duration.days(7).toSeconds()),
            },
        });

        getter.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['appsync:CreateApiKey', 'appsync:ListApiKeys'],
                effect: iam.Effect.ALLOW,
                resources: ['*'],
            }),
        );

        this.lambda = getter;
    }
}
