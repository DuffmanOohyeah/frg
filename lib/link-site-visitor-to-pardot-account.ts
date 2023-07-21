import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as secretsManager from '@aws-cdk/aws-secretsmanager';
import { SopsSecretsManager } from 'sops-secretsmanager-cdk';

interface LinkSiteVisitorToPardotAccountProps {
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly secretName: string;
    readonly secretsPath: string;
    readonly pardotUrl: string;
}

export class LinkSiteVisitorToPardotAccount extends cdk.Construct {
    public readonly candidateLambda: lambda.Function;
    linkSiteVisitorToPardotAccountLambda: lambda.Function;
    constructor(scope: cdk.Construct, id: string, props: LinkSiteVisitorToPardotAccountProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'LinkSiteVisitorToPardotAccount');

        const secret = new secretsManager.Secret(this, 'Secret', {
            secretName: props.secretName,
            description: 'LinkSiteVisitorToPardotAccount Creds',
        });

        // This takes secrets from the sops file at
        // props.secretsPath and puts them into the SecretsManager secret.
        // See https://github.com/isotoma/sops-secretsmanager-cdk.
        new SopsSecretsManager(this, 'Secrets', {
            path: props.secretsPath,
            secret,
            mappings: {
                clientId: {
                    path: ['linkSiteVisitorToPardotAccountCredentials', 'clientId'],
                },
                userKey: {
                    path: ['linkSiteVisitorToPardotAccountCredentials', 'userKey'],
                },
                clientSecret: {
                    path: ['linkSiteVisitorToPardotAccountCredentials', 'clientSecret'],
                },
                password: {
                    path: ['linkSiteVisitorToPardotAccountCredentials', 'password'],
                },
                pardotBusinessUnitId: {
                    path: ['linkSiteVisitorToPardotAccountCredentials', 'pardotBusinessUnitId'],
                },
            },
            fileType: 'yaml',
        });

        const linkSiteVisitorToPardotAccountLambda = new nodeJsLambda.NodejsFunction(this, 'LinkSiteVisitorToPardotAccountLambda', {
            entry: './backend/link-site-visitor-to-pardot-account/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'warn',
                LINK_SITE_VISITOR_TO_PARDOT_ACCOUNT: secret.secretArn,
                PARDOT_URL: props.pardotUrl,
            },
        });

        this.linkSiteVisitorToPardotAccountLambda = linkSiteVisitorToPardotAccountLambda;
        secret.grantRead(linkSiteVisitorToPardotAccountLambda);
    }
}
