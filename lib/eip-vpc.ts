import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { EipNatProvider } from './utils/natGatewayWorkaround';

export interface EipVpcConfig {
    readonly enabled?: boolean;
    readonly allocations?: Array<string>;
}

export interface EipVpcProps {
    readonly config: EipVpcConfig;
}

export class EipVpc extends cdk.Construct {
    readonly vpc?: ec2.Vpc;

    constructor(scope: cdk.Construct, id: string, props: EipVpcProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'EipVpc');

        const enabled = !!props.config.enabled;

        if (enabled) {
            let vpcProps = {
                cidr: '10.90.0.0/16',
                maxAzs: 2,
                natGatewayProvider: ec2.NatProvider.gateway(),
            };

            // If allocations are passed, use them, one AZ per
            // allocation. Otherwise, just one AZ, using whatever EIPs AWS
            // gives us.
            if (props.config.allocations && props.config.allocations.length) {
                vpcProps = {
                    ...vpcProps,
                    maxAzs: props.config.allocations.length,
                    natGatewayProvider: new EipNatProvider(props.config.allocations),
                };
            }
            this.vpc = new ec2.Vpc(this, 'Vpc', vpcProps);
        }
    }
}
