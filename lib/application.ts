#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { FrgStack } from './frg-stack';
import { Environment } from './config/environments';

export interface ApplicationProps extends cdk.StageProps {
    readonly name: string;
    readonly environment: Environment;
}

export class Application extends cdk.Stage {
    constructor(scope: cdk.Construct, id: string, props: ApplicationProps) {
        super(scope, id, props);
        for (const brand of props.environment.brands) {
            const stackName = brand.stackNameOverride ?? `Frg${props.name}${brand.brand}Stack`;
            new FrgStack(this, stackName, brand, { stackName });
        }
    }
}
