// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import * as pipelines from '@aws-cdk/pipelines';
import * as application from './application';
import { environments } from './config/environments';

export interface PipelineStackProps extends cdk.StackProps {
    readonly owner: string;
    readonly repo: string;
}

class PipelineStack extends cdk.Stack {
    public pipeline: pipelines.CdkPipeline;

    constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
        const environmentName = process.env.ENVIRONMENT_NAME;
        const copyEnvironmentVariables = ['ENVIRONMENT_NAME'];
        if (environmentName === undefined) {
            throw new Error('Environment variables not set');
        }
        const environment = environments[environmentName];

        if (!environment) {
            console.error(`Environment ${environmentName} not found`);
            process.exit(1);
        }
        super(scope, `${environmentName}-${id}`, props);
        const sourceArtifact = new codepipeline.Artifact();
        const cloudAssemblyArtifact = new codepipeline.Artifact();

        const sourceAction = new actions.GitHubSourceAction({
            actionName: 'GitHub',
            output: sourceArtifact,
            oauthToken: cdk.SecretValue.secretsManager('GithubToken'),
            owner: props.owner,
            repo: props.repo,
            branch: environment.branchName,
        });

        const synthAction = pipelines.SimpleSynthAction.standardNpmSynth({
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged: true, // needed for docker-built artifacts
            },
            sourceArtifact,
            cloudAssemblyArtifact,
            buildCommand: 'make -j 8 && docker login --username isotomacd --password=33f3840f-bd2a-4505-b86e-bab11ab73e29',
            copyEnvironmentVariables,
            rolePolicyStatements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    resources: ['arn:aws:kms:eu-west-2:787009838971:key/7a3bee04-cd56-4430-bc22-8cc3b78c22df'],
                    actions: ['kms:Decrypt'],
                }),
            ],
        });

        this.pipeline = new pipelines.CdkPipeline(this, 'Pipeline', {
            pipelineName: `${environmentName}-infrastructure`,
            cloudAssemblyArtifact,
            sourceAction,
            synthAction,
            // this version is passed to the asset and SelfMutate stages and the
            // cdk is installed with that version instead of the most recent
            cdkCliVersion: '1.120.0',
        });
        const stage = this.pipeline.addApplicationStage(
            new application.Application(this, environmentName, {
                ...props,
                name: environmentName,
                environment,
                env: {
                    account: environment.targetAwsAccount,
                    region: 'eu-west-2',
                },
            }),
        );

        if (!environment.skipManualApproval) {
            stage.addActions(new actions.ManualApprovalAction({ actionName: 'approval' }));
        }

        // Adapted from https://github.com/aws/aws-cdk/issues/10999#issuecomment-716478132
        const assetPublishingActions = this.pipeline.stage('Assets').actions;
        for (const action of assetPublishingActions) {
            if (action.actionProperties.actionName.startsWith('Docker')) {
                const commands: string[] = ((action as unknown) as { commands: string[] }).commands;
                const command = 'docker login --username isotomacd --password=33f3840f-bd2a-4505-b86e-bab11ab73e29';
                if (!commands.includes(command)) {
                    commands.unshift(command);
                }
            }
        }
    }
}

const app = new cdk.App();
new PipelineStack(app, 'pipeline', {
    owner: 'isotoma',
    repo: 'frg',
    env: {
        // account: '943116035304', // infrastructure
        region: 'eu-west-2',
    },
});
