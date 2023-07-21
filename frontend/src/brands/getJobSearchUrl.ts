import { cond, equals, always } from 'ramda';

const getJobSearchUrl = cond<string, string>([
    [equals('Anderson'), always('/netsuite-jobs')],
    [equals('FrgTech'), always('/tech-jobs')],
    [equals('Jefferson'), always('/aws-jobs')],
    [equals('Mason'), always('/salesforce-jobs')],
    [equals('Nelson'), always('/servicenow-jobs')],
    [equals('Nigel'), always('/microsoft-jobs')],
    [equals('Washington'), always('/erp-jobs')],
]);

export default getJobSearchUrl;
