import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deployment from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53targets from '@aws-cdk/aws-route53-targets';
import * as R from 'ramda';
import { upperFirst } from './utils';

interface CandidateSearchDomainsConfig {
    readonly sslCertificateArn: string;
    readonly subdomainsToCreate?: Array<string>;
    // Domains that are added to the Cloudfront distribution, but for
    // which we create no DNS records.
    readonly additionalDomains?: Array<string>;
    readonly minimumProtocolVersion?: cloudfront.SecurityPolicyProtocol;
}

export interface HostingDomainsBaseConfig {
    readonly hostedZoneDomainName: string;
    readonly hostedZoneId: string;
    // If this array is empty or not given, then will use the hostedZoneDomainName
    readonly subdomainsToCreate?: Array<string>;
    // Domains that are added to the Cloudfront distribution, but for
    // which we create no DNS records.
    readonly additionalDomains?: Array<string>;
    // only create the additional domains - used in prod to disable the background urls
    readonly additionalDomainsOnly?: boolean;
    // The certificate. Note that the names this covers must include
    // all of the domain names, both the subdomains created and the
    // additional domains.
    readonly sslCertificateArn: string;
    // Supported TLS protocols and ciphers
    // More info: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html#secure-connections-supported-ciphers
    readonly minimumProtocolVersion?: cloudfront.SecurityPolicyProtocol;
    readonly candidateSearch?: CandidateSearchDomainsConfig;
}

interface HostingDomainsConfig extends HostingDomainsBaseConfig {
    readonly enabled?: boolean;
}

export interface HostingConfig {
    readonly domains?: HostingDomainsConfig;
    readonly denyRobots?: boolean;
}

interface HostingProps {
    originConfigs: Array<cloudfront.SourceConfiguration>;
    candidateSearchOriginConfig?: cloudfront.SourceConfiguration;
    removalPolicy: cdk.RemovalPolicy;
    config: HostingConfig;
}

export class Hosting extends cdk.Construct {
    readonly domainName: string;
    readonly candidateSearchDomainName: string | undefined;

    protected hostedZone: route53.IHostedZone | undefined;

    constructor(scope: cdk.Construct, id: string, props: HostingProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'Hosting');

        let domainsConfig: HostingDomainsBaseConfig | undefined = undefined;
        if (props.config.domains && props.config.domains.enabled) {
            domainsConfig = {
                ...R.omit(['enabled'], props.config.domains),
            } as HostingDomainsBaseConfig;
        }

        let namesToCreate;
        let aliasConfiguration;

        if (typeof domainsConfig !== 'undefined') {
            namesToCreate = this.getNamesToCreate(domainsConfig.subdomainsToCreate, domainsConfig.hostedZoneDomainName) || [domainsConfig.hostedZoneDomainName];
            const additionalNames = domainsConfig.additionalDomains || [];
            aliasConfiguration = this.getAliasConfiguration(
                domainsConfig.additionalDomainsOnly ? additionalNames : namesToCreate.concat(additionalNames),
                domainsConfig.sslCertificateArn,
                domainsConfig.minimumProtocolVersion,
            );
        }

        if (props.config.denyRobots) {
            const denyRobotsBucket = new s3.Bucket(this, 'Robots', {
                blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            });

            new s3deployment.BucketDeployment(this, 'RobotsDeploy', {
                sources: [s3deployment.Source.asset('./backend/deny-robots')],
                destinationBucket: denyRobotsBucket,
            });

            const oai = new cloudfront.OriginAccessIdentity(this, 'RobotsOAI');
            denyRobotsBucket.grantRead(oai);

            props.originConfigs.push({
                s3OriginSource: {
                    s3BucketSource: denyRobotsBucket,
                    originAccessIdentity: oai,
                },
                behaviors: [
                    {
                        defaultTtl: cdk.Duration.seconds(60),
                        pathPattern: 'robots.txt',
                    },
                ],
            });
        }

        const cloudfrontLogsBucket = new s3.Bucket(this, 'CloudfrontLogging', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: props.removalPolicy,
        });

        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'Dist', {
            originConfigs: props.originConfigs,
            ...(aliasConfiguration ? { aliasConfiguration } : {}),
            errorConfigurations: [
                {
                    errorCode: 404,
                    errorCachingMinTtl: 0,
                },
            ],
            loggingConfig: {
                bucket: cloudfrontLogsBucket,
                prefix: 'main/',
            },
        });

        if (typeof domainsConfig !== 'undefined' && typeof namesToCreate !== 'undefined' && namesToCreate.length > 0) {
            const hostedZone = this.getHostedZone(domainsConfig.hostedZoneId, domainsConfig.hostedZoneDomainName);

            R.forEach((domainName: string): void => {
                new route53.ARecord(this, upperFirst(domainName.split('.')[0]), {
                    target: route53.RecordTarget.fromAlias(new route53targets.CloudFrontTarget(distribution)),
                    zone: hostedZone,
                    recordName: domainName,
                    ttl: cdk.Duration.minutes(30),
                });
            }, namesToCreate);
            this.domainName = namesToCreate[0] as string;
        } else {
            this.domainName = distribution.domainName;
        }

        if (domainsConfig?.candidateSearch && props.candidateSearchOriginConfig) {
            const csConf: CandidateSearchDomainsConfig = domainsConfig.candidateSearch;

            const csNamesToCreate = this.getNamesToCreate(csConf.subdomainsToCreate, domainsConfig.hostedZoneDomainName) || [];
            const csAdditionalNames = csConf.additionalDomains || [];
            const aliasNames = csNamesToCreate.concat(csAdditionalNames);

            const csAliasNames = domainsConfig.additionalDomainsOnly ? csAdditionalNames : aliasNames;
            const csAliasConfiguration = aliasNames.length ? this.getAliasConfiguration(csAliasNames, csConf.sslCertificateArn, csConf.minimumProtocolVersion) : undefined;

            const candidateSearchDistribution = new cloudfront.CloudFrontWebDistribution(this, 'CSDist', {
                originConfigs: [props.candidateSearchOriginConfig],
                ...(csAliasConfiguration ? { aliasConfiguration: csAliasConfiguration } : {}),
                errorConfigurations: [
                    {
                        errorCode: 404,
                        errorCachingMinTtl: 0,
                    },
                ],
                loggingConfig: {
                    bucket: cloudfrontLogsBucket,
                    prefix: 'candidate-search-redirector/',
                },
            });

            if (typeof domainsConfig !== 'undefined' && typeof csNamesToCreate !== 'undefined' && csNamesToCreate.length > 0) {
                const csHostedZone = this.getHostedZone(domainsConfig.hostedZoneId, domainsConfig.hostedZoneDomainName);

                R.forEach((domainName: string): void => {
                    new route53.ARecord(this, upperFirst(domainName.split('.')[0]), {
                        target: route53.RecordTarget.fromAlias(new route53targets.CloudFrontTarget(candidateSearchDistribution)),
                        zone: csHostedZone,
                        recordName: domainName,
                        ttl: cdk.Duration.minutes(30),
                    });
                }, csNamesToCreate);
                this.candidateSearchDomainName = csNamesToCreate[0] as string;
            } else {
                this.candidateSearchDomainName = candidateSearchDistribution.domainName;
            }
        }
    }

    getAliasConfiguration(names: Array<string>, sslCertificateArn: string, minimumProtocolVersion: cloudfront.SecurityPolicyProtocol | undefined): cloudfront.AliasConfiguration {
        // Ignoring because this should never happen
        /* istanbul ignore next */
        if (names.length === 0) {
            throw new Error('Tried to get alias configuration with no alias domains');
        }
        return {
            acmCertRef: sslCertificateArn,
            names,
            ...(minimumProtocolVersion ? { securityPolicy: minimumProtocolVersion } : {}),
        };
    }

    getNamesToCreate(subdomains: Array<string> | undefined, hostedZoneDomainName: string): Array<string> | undefined {
        if (!subdomains || subdomains.length === 0) {
            return undefined;
        }
        return subdomains.map((subdomain: string): string => `${subdomain}.${hostedZoneDomainName}`);
    }

    getHostedZone(id: string, domainName: string): route53.IHostedZone {
        if (typeof this.hostedZone === 'undefined') {
            this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                hostedZoneId: id,
                zoneName: domainName,
            });
        }
        return this.hostedZone;
    }
}
