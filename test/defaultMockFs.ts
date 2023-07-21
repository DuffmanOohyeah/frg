/* eslint-disable @typescript-eslint/naming-convention */
import * as R from 'ramda';
import * as MockFsFileSystem from 'mock-fs/lib/filesystem';
import * as fs from 'fs';

const loadRealFiles = (realFiles: Array<string>): Record<string, string> => {
    const loadFile = (filepath: string): R.KeyValuePair<string, string> => [filepath, fs.readFileSync(filepath, 'utf8')];
    return R.fromPairs(R.map(loadFile, realFiles));
};

export const defaultMockFs = {
    // Asset directories
    'backend/wordpress/api/main.ts': {},
    'backend/wordpress/fetcher/fetcher/__init__.py': {},
    'backend/confirmsignup/main.ts': {},
    'backend/postauthpostconfirm/main.ts': {},
    'backend/custommessage/main.ts': {},
    'backend/apikeys/main.ts': {},
    'backend/search-ingestion/s3-to-es/main.ts': {},
    'backend/search-ingestion/delete-older-than/main.ts': {},
    'backend/search-ingestion/reindex/main.ts': {},
    'backend/search-ingestion/broadbean-api/main.ts': {},
    'backend/search/main.ts': {},
    'backend/candidate-profile/main.ts': {},
    'backend/candidate-profile-api/main.ts': {},
    'backend/employer-profile/main.ts': {},
    'extra_assets/github-cognito-openid-wrapper-assets/': {},
    'extra_assets/linkedin-cognito-openid-wrapper-assets/': {},
    'backend/candidate-search-redirector/main.ts': {},
    'backend/email-alerts/getCandidates/getCandidates.ts': {},
    'backend/email-alerts/getUsersAlerts/getUsersAlerts.ts': {},
    'backend/email-alerts/sendEmail/sendEmail.ts': {},
    'backend/email-alerts/sendRequest/sendRequest.ts': {},
    'backend/email-alerts/userFanOut/userFanOut.ts': {},
    'backend/email-alerts/getEmployers/getEmployers.ts': {},
    'backend/indeed-sitemap/main.ts': {},
    'backend/deny-robots/': {},
    'backend/link-site-visitor-to-pardot-account/main.ts': {},
    'backend/process-rtbf-unsubscribe-requests/lamda/handler.ts': {},

    // Asset dependency file
    'backend/package-lock.json': '',

    // Other files
    'frontend/Dockerfile': 'FROM scratch',
    './lib/schema.graphql': 'schemacontent',

    // Config files
    './secrets/stage.yaml': 'secretdata',

    // Dependencies
    './node_modules/sops-secretsmanager-cdk/provider/': {},
    './node_modules/es-settings-cdk/provider/': {},
    './node_modules/@aws-cdk/custom-resources/lib/provider-framework/runtime/': {},
    './node_modules/@aws-cdk/aws-s3-deployment/lambda/src': {},
    './node_modules/@aws-cdk/aws-s3-deployment/lambda/bundle.zip': 'bundlezip',
    './node_modules/@aws-cdk/lambda-layer-awscli/layer/Dockerfile': 'dockerfile',
    './node_modules/@aws-cdk/lambda-layer-awscli/lib/layer.zip': 'layerzip',
    './node_modules/@aws-cdk/aws-s3-deployment/lib/lambda': {},
    './node_modules/@aws-cdk/aws-s3/lib/notifications-resource/lambda/index.py': 'index',

    // Real files
    ...loadRealFiles([
        // This is loaded at runtime, and without this creating the stacks fails
        './node_modules/@aws-cdk/cloud-assembly-schema/schema/cloud-assembly.version.json',
    ]),
} as MockFsFileSystem.DirectoryItems;
