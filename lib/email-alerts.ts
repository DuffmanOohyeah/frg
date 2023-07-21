import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import * as secretsManager from '@aws-cdk/aws-secretsmanager';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import { SopsSecretsManager } from 'sops-secretsmanager-cdk';
import { FrgBrand } from './utils/FrgBrand';

interface EmailAlertsCustomDomainEnabled {
    readonly useHostingDomain: false;
    readonly customDomainName: string;
}

interface EmailAlertsCustomDomainDisabled {
    readonly useHostingDomain: true;
}

interface EmailAlertsCronEnabled {
    readonly enabled: true;
    readonly schedule: events.CronOptions;
}

interface EmailAlertsCronDisabled {
    readonly enabled: false;
}

export type EmailAlertsConfig = {
    readonly domainName: EmailAlertsCustomDomainEnabled | EmailAlertsCustomDomainDisabled;
    readonly cron?: EmailAlertsCronEnabled | EmailAlertsCronDisabled;
};

interface EmailAlertsProps {
    userdataDb: dynamodb.ITable;
    secretName: string;
    secretsPath: string;
    config: EmailAlertsConfig;
    searchLambda: lambda.Function;
    hostingDomain: string;
    brand: FrgBrand;
    vpc: ec2.IVpc;
}

export class EmailAlerts extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: EmailAlertsProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'EmailAlerts');

        // gets the users searches and name from dynamoDb
        const getUsersAlertsLambda = new nodeJsLambda.NodejsFunction(this, 'getUsersAlertsLambda', {
            entry: './backend/email-alerts/getUsersAlerts/getUsersAlerts.ts',
            handler: 'getUsersAlerts',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'warn',
                USERDATA_DB_NAME: props.userdataDb.tableName,
            },
        });

        // call daxtra for each of a users saved jobs
        const sendRequestLambda = new nodeJsLambda.NodejsFunction(this, 'sendRequestLambda', {
            entry: './backend/email-alerts/sendRequest/sendRequest.ts',
            handler: 'sendRequest',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'warn',
                SEARCH_LAMBDA_NAME: props.searchLambda.functionArn,
                USERDATA_DB_NAME: props.userdataDb.tableName,
            },
        });

        const secret = new secretsManager.Secret(this, 'Secret', {
            secretName: props.secretName,
            description: 'Mandrill API username and password',
        });

        // This takes secrets from the sops file at
        // props.secretsPath and puts them into the SecretsManager
        // secret. See
        // https://github.com/isotoma/sops-secretsmanager-cdk.
        new SopsSecretsManager(this, 'Secrets', {
            path: props.secretsPath,
            secret,
            mappings: {
                mandrillCredentials: {
                    path: ['mandrillCredentials', 'mandrillApiKey'],
                },
            },
            fileType: 'yaml',
        });

        const sendEmailLambda = new nodeJsLambda.NodejsFunction(this, 'sendEmailLambda', {
            entry: './backend/email-alerts/sendEmail/sendEmail.ts',
            handler: 'sendEmailHandler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'warn',
                BRAND: props.brand,
                USERDATA_DB_NAME: props.userdataDb.tableName,
                SECRET_ARN: secret.secretArn,
                DOMAIN_NAME: props.config.domainName.useHostingDomain ? props.hostingDomain : props.config.domainName.customDomainName,
            },
            vpc: props.vpc,
        });

        const getUserAlerts = new sfn.Task(this, 'Gather search specs', {
            task: new tasks.InvokeFunction(getUsersAlertsLambda),
            // Put Lambda's result here in the execution's state object
            inputPath: '$.user',
            resultPath: '$.guid',
        });

        const sendEmail = new sfn.Task(this, 'Send to sendEmail', {
            task: new tasks.InvokeFunction(sendEmailLambda),
            // Pass just the field named "guid" into the Lambda, put the
            // Lambda's result in a field called "status"
            inputPath: '$.searchResults',
            resultPath: '$.status',
        });

        const emailsSent = new sfn.Pass(this, 'emailsSent', {
            inputPath: '$.status',
        });

        const emailsNotSent = new sfn.Pass(this, 'emailsNotSent', {
            inputPath: '$.status',
        });

        const jobFailed = new sfn.Fail(this, 'Job Failed', {
            cause: 'Batch Job Failed',
            error: 'StateMachine returned FAILED',
        });

        const mapOverSearches = new sfn.Map(this, 'doParrallelSearches', {
            inputPath: '$.guid',
            resultPath: '$.searchResults',
        })
            .iterator(
                new sfn.Task(this, 'runSearchRequests', {
                    task: new tasks.InvokeFunction(sendRequestLambda),
                    // Pass just the field named "guid" into the Lambda, put the
                    // Lambda's result in a field called "status"
                }),
            )
            .addRetry({ maxAttempts: 2 });

        const definition = getUserAlerts
            .next(mapOverSearches)
            .next(sendEmail)
            .next(
                new sfn.Choice(this, 'Job Complete?')
                    // Look at the "status" field
                    .when(sfn.Condition.stringEquals('$.status', 'SUCCEEDED'), emailsSent)
                    .when(sfn.Condition.stringEquals('$.status', 'NO_EMAILS_TO_SEND'), emailsNotSent)
                    .otherwise(jobFailed),
            );

        const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
            definition,
            timeout: cdk.Duration.minutes(5),
        });

        // calls a step function for each user
        const userFanOutLambda = new nodeJsLambda.NodejsFunction(this, 'userFanOutLambda', {
            entry: './backend/email-alerts/userFanOut/userFanOut.ts',
            handler: 'userFanOut',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.minutes(15),
            environment: {
                LOG_LEVEL: 'warn',
                STATE_MACHINE: stateMachine.stateMachineArn,
            },
        });

        // gets the candidates from dynamoDb
        const getCandidatesLambda = new nodeJsLambda.NodejsFunction(this, 'getCandidatesLambda', {
            entry: './backend/email-alerts/getCandidates/getCandidates.ts',
            handler: 'getCandidates',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.minutes(15),
            environment: {
                LOG_LEVEL: 'warn',
                CANDIDATES_DB_NAME: props.userdataDb.tableName,
                USER_FAN_OUT_LAMBDA_NAME: userFanOutLambda.functionName,
            },
        });

        // gets the employers from dynamoDb
        const getEmployersLambda = new nodeJsLambda.NodejsFunction(this, 'getEmployersLambda', {
            entry: './backend/email-alerts/getEmployers/getEmployers.ts',
            handler: 'getEmployers',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.minutes(15),
            environment: {
                LOG_LEVEL: 'warn',
                EMPLOYERS_DB_NAME: props.userdataDb.tableName,
                USER_FAN_OUT_LAMBDA_NAME: userFanOutLambda.functionName,
            },
        });

        const { config } = props;

        if (config.cron?.enabled) {
            const emailAlertsRule = new events.Rule(this, 'EmailAlerts', {
                schedule: events.Schedule.cron(config.cron.schedule),
            });
            emailAlertsRule.addTarget(new eventsTargets.LambdaFunction(getCandidatesLambda));
            emailAlertsRule.addTarget(new eventsTargets.LambdaFunction(getEmployersLambda));
        }

        props.userdataDb.grantReadData(getCandidatesLambda);

        props.userdataDb.grantReadData(getEmployersLambda);
        userFanOutLambda.grantInvoke(getEmployersLambda);

        props.userdataDb.grantReadData(getUsersAlertsLambda);

        props.userdataDb.grantReadData(sendRequestLambda);

        props.userdataDb.grantReadWriteData(sendEmailLambda);

        props.searchLambda.grantInvoke(sendRequestLambda);

        userFanOutLambda.grantInvoke(getCandidatesLambda);

        const getCandidatesStatement = new iam.PolicyStatement({
            actions: ['lambda:InvokeFunction'],
            resources: [getCandidatesLambda.functionArn],
        });
        const getCandidatesPolicy = new iam.Policy(this, 'getCandidatesPolicy', {
            statements: [getCandidatesStatement],
        });
        /* istanbul ignore next */
        if (!getCandidatesLambda.role) throw new Error('getCandidatesLambda missing role');
        getCandidatesPolicy.attachToRole(getCandidatesLambda.role);

        const getEmployersStatement = new iam.PolicyStatement({
            actions: ['lambda:InvokeFunction'],
            resources: [getEmployersLambda.functionArn],
        });
        const getEmployersPolicy = new iam.Policy(this, 'getEmployersPolicy', {
            statements: [getEmployersStatement],
        });
        /* istanbul ignore next */
        if (!getEmployersLambda.role) throw new Error('getEmployersLambda missing role');
        getEmployersPolicy.attachToRole(getEmployersLambda.role);

        stateMachine.grantStartExecution(userFanOutLambda);

        secret.grantRead(sendEmailLambda);
    }
}
