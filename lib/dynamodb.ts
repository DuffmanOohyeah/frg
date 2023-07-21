import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface DynamoDBConfig {
    readonly fromExistingTable?: string; // Can pass in a table name to use, eg if you've restored a table
}

interface DynamoDBProps {
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly config: DynamoDBConfig;
}

export class DynamoDB extends cdk.Construct {
    readonly userStateTable: dynamodb.ITable;

    constructor(scope: cdk.Construct, id: string, props: DynamoDBProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'DynamoDB');

        if (props.config.fromExistingTable) {
            this.userStateTable = dynamodb.Table.fromTableAttributes(this, 'UserState', {
                tableName: props.config.fromExistingTable,
            });
        } else {
            const table = new dynamodb.Table(this, 'UserState', {
                partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
                sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
                billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: true,
                serverSideEncryption: true,
                removalPolicy: props.removalPolicy,
            });
            table.addGlobalSecondaryIndex({
                partitionKey: { name: 'alt', type: dynamodb.AttributeType.STRING },
                sortKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
                indexName: 'alt',
                projectionType: dynamodb.ProjectionType.KEYS_ONLY,
            });

            this.userStateTable = table;
        }
    }
}
