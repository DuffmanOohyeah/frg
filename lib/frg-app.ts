#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrgStack } from './frg-stack';
import { environments } from './config/environments';
import { find } from 'ramda';

// Check that we have chosen a stack to build
if (!process.env.ENVIRONMENT_NAME || !process.env.BRAND) {
    throw new Error('No stack or environment name provided');
}

// Get stackIdentifier
const brand = process.env.BRAND;
const env = process.env.ENVIRONMENT_NAME;
const environmentConfig = environments[env];
if (!environmentConfig) {
    throw new Error(`No config found for environment '${env}'`);
}

const stackConfig = find(brandConfig => brandConfig.brand === brand, environmentConfig.brands);
if (!stackConfig) {
    throw new Error(`Stack brand '${brand}' could not befound for env '${env}'`);
}

// Since we are here then we are probably trying to manually deploy the stack so check that we
// have activated as the right profile
const envExpectedAwsProfileMap: Record<string, string> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    Dev: 'frg-org-stage-IsotomaAdmin',
    Prod: 'frg-org-production-IsotomaAdmin',
    Stage: 'frg-org-stage-IsotomaAdmin',
    /* eslint-enable @typescript-eslint/naming-convention */
};
const stackProfile = envExpectedAwsProfileMap[env];
if (process.env.AWS_PROFILE !== stackProfile) {
    throw new Error(
        // eslint-disable-next-line max-len
        `Activated aws profile "${process.env.AWS_PROFILE}" does not match expected profile "${stackProfile}" for "${env}" env`,
    );
}

const stackName = stackConfig.stackNameOverride || `Frg${env}${stackConfig?.brand}Stack`;
// Make stack
const app = new cdk.App();
new FrgStack(app, stackName, stackConfig);
