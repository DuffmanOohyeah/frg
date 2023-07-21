import { AmazonConnection, AmazonTransport } from 'aws-elasticsearch-connector';
import { Client as ESClient } from '@elastic/elasticsearch';

const getAwsESClient = (esHost: string): ESClient => {
    return new ESClient({
        node: `http://${esHost}`,
        Connection: AmazonConnection,
        Transport: AmazonTransport,
    });
};

export default getAwsESClient;
