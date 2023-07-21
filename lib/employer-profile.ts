import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';

interface EmployerProfileProps {
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly secretName: string;
    readonly secretsPath: string;
    readonly userStateTable: dynamodb.ITable;
}

export default class EmployerProfile extends cdk.Construct {
    public readonly employerLambda: lambda.Function;
    constructor(scope: cdk.Construct, id: string, props: EmployerProfileProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'EmployerProfile');

        const employerLambda = new nodeJsLambda.NodejsFunction(this, 'EmployerProfile', {
            entry: './backend/employer-profile/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'warn',
                DYNAMODB_ARN: props.userStateTable.tableArn,
                DYNAMODB_TABLE_NAME: props.userStateTable.tableName,
            },
        });

        this.employerLambda = employerLambda;

        props.userStateTable.grantFullAccess(employerLambda);
    }
}
