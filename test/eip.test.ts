import { EipNatProvider } from '../lib/utils/natGatewayWorkaround';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

import { expect as expectCDK, haveResource } from '@aws-cdk/assert';

describe('eipnatprovider', () => {
    test('single allocation', () => {
        const stack = new cdk.Stack();
        new ec2.Vpc(stack, 'MyVPC', {
            cidr: '10.0.0.0/16',
            maxAzs: 1,
            natGatewayProvider: new EipNatProvider(['abc']),
        });

        expectCDK(stack).to(
            haveResource('AWS::EC2::NatGateway', {
                AllocationId: 'abc',
            }),
        );
    });

    test('multiple allocations', () => {
        const stack = new cdk.Stack(undefined, undefined, {
            env: {
                account: '123412341234',
                region: 'eu-west-1', // region with 3 AZs
            },
        });
        new ec2.Vpc(stack, 'MyVPC', {
            cidr: '10.0.0.0/16',
            maxAzs: 3,
            natGatewayProvider: new EipNatProvider(['abc', 'def', 'ghi']),
        });

        expectCDK(stack).to(
            haveResource('AWS::EC2::NatGateway', {
                AllocationId: 'abc',
            }),
        );
        expectCDK(stack).to(
            haveResource('AWS::EC2::NatGateway', {
                AllocationId: 'def',
            }),
        );
        expectCDK(stack).to(
            haveResource('AWS::EC2::NatGateway', {
                AllocationId: 'ghi',
            }),
        );
    });
});

describe('eipnatprovider validation', () => {
    test('insufficent allocations', () => {
        const stack = new cdk.Stack();

        // 2 AZs but 1 EIP allocation is not enough
        expect(() => {
            new ec2.Vpc(stack, 'MyVPC', {
                cidr: '10.0.0.0/16',
                maxAzs: 2,
                natGatewayProvider: new EipNatProvider(['abc']),
            });
        }).toThrowError('Unable to create NAT Gateways, requested 2, but only 1 EIPs available');
    });
});
