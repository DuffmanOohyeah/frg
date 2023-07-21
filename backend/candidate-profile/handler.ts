import * as winston from 'winston';
import { S3, DynamoDB } from 'aws-sdk';
import { serializeError } from 'serialize-error';
import { HandlerContext } from './main';
import doDaxtraParse from './daxtra/doDaxtraParse';
import { getCredentials } from './getCredentials';
import {
    ParseCVEvent,
    SaveJobSearchEvent,
    SavedJobSearchData,
    GetSavedJobSearchesEvent,
    DeleteSavedJobSearchEvent,
    GetSignedUrlEvent,
    GetSkillsEvent,
    GetAccreditationsEvent,
    GetEmploymentPreferencesEvent,
    UpdateSavedJobSearchEvent,
    SaveJobSearchParameters,
    GetSignedUrlTemporaryEvent,
    ParseCVTemporaryEvent,
} from './inputTypes';
import { GetSavedJobSearchesDBQuery, GetSavedJobSearchesData, DeleteSavedJobSearch, UpdateSavedJobSearchOutput } from './outputTypes';
import { uuid } from 'uuidv4';
import { pick, map } from 'ramda';
import { isLeft } from 'fp-ts/lib/Either';
import { extractFromParsedCV, DaxtraExtractedData } from './daxtra/extractFromParsedCV';
import { getPhoenixConfig, fetchAndCache } from './phoenixFetchAndCache';
import { listSkills, listAccreditations, listEmploymentPreferences, ListEmploymentPreferencesResponse, ListAccreditationsResponse, ListSkillsResponse } from './phoenix';
import { CreateCandidateProfileEvent, createCandidateProfile } from './profile/createCandidateProfile';
import { GetCandidateProfileEvent, getCandidateProfile } from './profile/getCandidateProfile';
import { updateCandidateProfile, UpdateCandidateProfileEvent } from './profile/updateCandidateProfile';
import { OutputProfile } from './profile/Profile';
import { addJobToShortlist, AddJobToShortlistEvent } from './savedJobs/addJobToShortlist';
import { getJobShortlist, GetJobShortlistEvent } from './savedJobs/getJobShortlist';
import { RemoveJobFromShortlistEvent, removeJobFromShortlist } from './savedJobs/removeJobFromShortlist';
import { ApplyForJobEvent, applyForJob } from './jobApplications/applyForJob';
import { GetJobApplicationLogsEvent, getJobApplicationLogs } from './jobApplications/getJobApplicationLogs';
import { getCvDownloadUrl, GetCvDownloadUrlData, GetCvDownloadUrlEvent } from './candidateCv/getCvDownloadUrl';
import { scrubEmailAddress } from './utils';
import axios from 'axios';
import { Identity } from './Identity';

const parseCV = async (key: string, identity: Identity, context: HandlerContext): Promise<DaxtraExtractedData> => {
    const params = {
        Bucket: context.bucketName,
        // identity is the cognioto users sub, key is the filename of the cv
        Key: `${encodeURIComponent(identity.claims.email)}/${key}`,
    };
    const s3 = new S3();
    try {
        winston.info('Fetching CV file from S3', { params });
        const s3Data = await s3.getObject(params).promise();
        winston.info('file from s3 received');
        if (!s3Data.Body) throw new Error('no data from s3');
        const cv = s3Data.Body.toString('base64');
        winston.info('Fetching credentials from secret for daxtra', { daxtraSecretArn: context.daxtraSecretArn });
        const credentials = await getCredentials(context.daxtraSecretArn);
        winston.info('sending file to daxtra for parsing', { integration: 'daxtra', action: 'doDaxtraParse', status: 'attempting' });
        const parsedCV = await doDaxtraParse(cv, context.daxtraURL, credentials);
        winston.info('response from daxtra received', { parsedCV, integration: 'daxtra', action: 'doDaxtraParse', status: 'success' });
        const extractedData = extractFromParsedCV(parsedCV);
        winston.info('extracted data being returned', extractedData);
        return extractedData;
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during cv parsing');
    }
};

const parseCVTemporary = async (signedGetUrl: string, contentType: string, context: HandlerContext): Promise<DaxtraExtractedData> => {
    const getCVRequestOptions = {
        headers: {
            'Content-Type': contentType,
        },
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
    } as const;
    try {
        winston.info('Fetching CV file from S3', { getCVRequestOptions });
        const s3Data = await axios.get(signedGetUrl, getCVRequestOptions);
        winston.info('file from s3 received');
        if (!s3Data.data) throw new Error('no data from s3');
        const cv = s3Data.data.toString('base64');
        winston.info('Fetching credentials from secret for daxtra', { daxtraSecretArn: context.daxtraSecretArn });
        const credentials = await getCredentials(context.daxtraSecretArn);
        winston.info('sending file to daxtra for parsing', { integration: 'daxtra', action: 'doDaxtraParse', status: 'attempting' });
        const parsedCV = await doDaxtraParse(cv, context.daxtraURL, credentials);
        winston.info('response from daxtra received', { integration: 'daxtra', action: 'doDaxtraParse', status: 'success' });
        const extractedData = extractFromParsedCV(parsedCV);
        winston.info('extracted data being returned');
        return extractedData;
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during cv parsing');
    }
};

interface GetSignedUrlData {
    put: string;
    get: string;
}
const getSignedUrl = async (key: string, filetype: string, identity: Identity, context: HandlerContext): Promise<GetSignedUrlData> => {
    const s3 = new S3();
    const SIGNED_URL_EXPIRE_TIME = 900; //time to expire in seconds
    const getParams = {
        Bucket: context.bucketName,
        // identity is the cognioto users sub, key is the filename of the cv
        Key: `${encodeURIComponent(identity.claims.email)}/${key}`,
        Expires: SIGNED_URL_EXPIRE_TIME,
    };
    const putParams = {
        ...getParams,
        ContentType: filetype,
        Expires: SIGNED_URL_EXPIRE_TIME,
    };
    try {
        winston.info('Fetching signed url', { getParams, putParams });
        const signedGetUrl = await s3.getSignedUrlPromise('getObject', getParams);
        const signedPutUrl = await s3.getSignedUrlPromise('putObject', { ...putParams });
        winston.info('url received');
        return { get: signedGetUrl, put: signedPutUrl };
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during fetching signed url');
    }
};

const getSignedUrlTemporary = async (key: string, filetype: string, context: HandlerContext): Promise<GetSignedUrlData> => {
    const s3 = new S3();
    const path = uuid();
    const SIGNED_URL_EXPIRE_TIME = 900; //time to expire in seconds
    const getParams = {
        Bucket: context.bucketName,
        Key: `temp/${path}/${key}`,
        Expires: SIGNED_URL_EXPIRE_TIME,
    };
    const putParams = {
        ...getParams,
        ContentType: filetype,
        Expires: SIGNED_URL_EXPIRE_TIME,
    };
    try {
        winston.info('Fetching signed url', { getParams, putParams });
        const signedGetUrl = await s3.getSignedUrlPromise('getObject', getParams);
        const signedPutUrl = await s3.getSignedUrlPromise('putObject', { ...putParams });
        winston.info('url received');
        return { get: signedGetUrl, put: signedPutUrl };
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during fetching signed url');
    }
};

const saveJobSearch = async (args: SavedJobSearchData, identity: Identity, context: HandlerContext): Promise<SavedJobSearchData> => {
    const searchParams = pick(['keyword', 'location', 'role', 'level', 'jobType', 'remote', 'security', 'newJobs', 'salaryFrom', 'salaryTo', 'salaryCurrency', 'product', 'segment'], args);
    // this replaces the nulls from graphql with undefined
    const replaceNullWithUndefined = (searchParams: SaveJobSearchParameters): SaveJobSearchParameters => map(searchParam => (searchParam === null ? undefined : searchParam), searchParams);
    const searchParamsWithoutNull = replaceNullWithUndefined(searchParams);
    const searchName = args.searchName;
    const {
        username,
        claims: { email },
    } = identity;
    // sso users that dont have an email adress use username instead of email
    const pk = `user_[${email || username}]`;
    const dateTime = Date.now();
    const sk = `saved_job_search_[${dateTime}]_[${uuid()}]`;
    winston.info('saving job search', { pk, sk, searchParams: searchParamsWithoutNull });
    const db = new DynamoDB.DocumentClient();
    const { tableName } = context;

    const params = {
        /* eslint-disable @typescript-eslint/naming-convention */
        TableName: tableName,
        Item: {
            pk,
            sk,
            search_name: searchName,
            search_params: searchParamsWithoutNull,
            email_alert: args.emailAlert,
        },
        /* eslint-enable @typescript-eslint/naming-convention */
    };
    try {
        await db.put(params).promise();
        winston.info('search saved successfully', { args });
        return { ...args };
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during search saving');
    }
};

const getSavedJobSearches = async (identity: Identity, context: HandlerContext): Promise<GetSavedJobSearchesData> => {
    const {
        username,
        claims: { email },
    } = identity;

    const db = new DynamoDB.DocumentClient();
    const { tableName } = context;
    try {
        const pk = `user_[${email}]`;
        winston.info('querying saved jobs');
        const newResults = await db
            .query({
                TableName: tableName,
                ExpressionAttributeValues: {
                    ':pk': pk,
                    ':sk': 'saved_job_search_[',
                },
                KeyConditionExpression: 'pk = :pk AND begins_with (sk, :sk)',
            })
            .promise();

        // this is for backwards compatibility, we used to store saved_job_search's with
        // a users username which meant it didn't match their email for sso users
        let oldResults: DynamoDB.DocumentClient.QueryOutput = {};
        if (username !== email) {
            const oldPk = `user_[${username}]`;
            oldResults = await db
                .query({
                    TableName: tableName,
                    ExpressionAttributeValues: {
                        ':pk': oldPk,
                        ':sk': 'saved_job_search_[',
                    },
                    KeyConditionExpression: 'pk = :pk AND begins_with (sk, :sk)',
                })
                .promise();
        }

        if (!newResults.Items && !oldResults.Items) {
            winston.info('no items found');
            return [];
        }

        const allData = [...(newResults.Items || []), ...(oldResults.Items || [])];
        const savedSearches = map(item => {
            const decoded = GetSavedJobSearchesDBQuery.decode(item);
            if (isLeft(decoded)) {
                winston.error('error received');
                throw new Error(`dynamoDB ${tableName} failed result type checks on item ${item}`);
            }
            const right = decoded.right;
            return { params: right.search_params, searchName: right.search_name, id: right.sk, emailAlert: right.email_alert };
        }, allData);

        winston.info('searches successfully found');
        return savedSearches;
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during fetching saved jobs search');
    }
};

const deleteSavedJobSearch = async (id: string, identity: Identity, context: HandlerContext): Promise<DeleteSavedJobSearch> => {
    const {
        username,
        claims: { email },
    } = identity;
    const pk = `user_[${email}]`;
    const oldPk = `user_[${username}]`;
    const db = new DynamoDB.DocumentClient();
    const { tableName } = context;

    try {
        winston.info('deleting saved job search', { id });
        await db
            .delete({
                TableName: tableName,
                Key: {
                    pk: pk,
                    sk: id,
                },
            })
            .promise();

        // this is for backwards compatibility, we used to store saved_job_search's with
        // a users username which meant it didn't match their email for sso users
        await db
            .delete({
                TableName: tableName,
                Key: {
                    pk: oldPk,
                    sk: id,
                },
            })
            .promise();
        // We dont use this returned value for anything other than having a return value for graphql.
        // There is no undefined return type in graphql and null isnt a type rather a representation of a
        // lack of value. So common practise is to return something rather than nothing.
        return { id };
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during delete saved job search');
    }
};

const getSkills = async (input: GetSkillsEvent, context: HandlerContext): Promise<ListSkillsResponse> => {
    try {
        const config = getPhoenixConfig({
            // If the request came from SNS, do not include the SNS details in the configuration
            includeSns: !input.fromSns,
        });
        winston.info('Fetching skills using fetchAndCache');
        return await fetchAndCache({
            config,
            args: input.args,
            identity: input.identity,
            fetcherPayload: {
                config: {
                    loginUrl: context.phoenixUrl,
                    secretArn: context.phoenixSecretArn,
                },
                funtionName: 'listSkills',
                function: listSkills,
                input: {},
            },
            cacheKey: 'skills',
            forceFetch: input.args.forceFetch || false,
            fieldName: input.field,
        });
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during getSkills');
    }
};

const getAccreditations = async (input: GetAccreditationsEvent, context: HandlerContext): Promise<ListAccreditationsResponse> => {
    try {
        const config = getPhoenixConfig({
            // If the request came from SNS, do not include the SNS details in the configuration
            includeSns: !input.fromSns,
        });
        winston.info('Fetching accreditation using fetchAndCache');
        return await fetchAndCache({
            config,
            args: input.args,
            identity: input.identity,
            fetcherPayload: {
                config: {
                    loginUrl: context.phoenixUrl,
                    secretArn: context.phoenixSecretArn,
                },
                function: listAccreditations,
                funtionName: 'listAccreditations',
                input: {},
            },
            cacheKey: 'accreditations',
            forceFetch: input.args.forceFetch || false,
            fieldName: input.field,
        });
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during getAccreditations');
    }
};

const getEmploymentPreferences = async (input: GetEmploymentPreferencesEvent, context: HandlerContext): Promise<ListEmploymentPreferencesResponse> => {
    try {
        const config = getPhoenixConfig({
            // If the request came from SNS, do not include the SNS details in the configuration
            includeSns: !input.fromSns,
        });
        winston.info('Fetching employment preferences using fetchAndCache');
        return await fetchAndCache({
            config,
            args: input.args,
            identity: input.identity,
            fetcherPayload: {
                config: {
                    loginUrl: context.phoenixUrl,
                    secretArn: context.phoenixSecretArn,
                },
                function: listEmploymentPreferences,
                funtionName: 'listEmploymentPreferences',
                input: {},
            },
            cacheKey: 'EmploymentPreferences',
            forceFetch: input.args.forceFetch || false,
            fieldName: input.field,
        });
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during getEmploymentPreferences');
    }
};

export const updateSavedJobSearch = async (id: string, enable: boolean, identity: Identity, context: HandlerContext): Promise<UpdateSavedJobSearchOutput> => {
    const {
        username,
        claims: { email },
    } = identity;

    const pk = `user_[${email}]`;
    const oldPk = `user_[${username}]`;
    const db = new DynamoDB.DocumentClient();
    const { tableName } = context;
    let oldPkResult;
    try {
        winston.info('checking if old saved job search', { id });
        oldPkResult = await db
            .get({
                TableName: tableName,
                Key: {
                    pk: oldPk,
                    sk: id,
                },
            })
            .promise();
    } catch (err) {
        winston.info('no old saved job search found', { id });
    }
    try {
        if (oldPkResult && oldPkResult.Item) {
            // this is for backwards compatibility, we used to store saved_job_search's with
            // a users username which meant it didn't match their email for sso users
            winston.info('converting old saved job search to new format and updating', { id });
            const decodedOldPkResult = GetSavedJobSearchesDBQuery.decode(oldPkResult.Item);
            if (isLeft(decodedOldPkResult)) {
                winston.error('error received');
                throw new Error(`dynamoDB ${tableName} failed result type checks on item ${decodedOldPkResult}`);
            }
            const rightOldPkResult = decodedOldPkResult.right;
            await db
                .delete({
                    TableName: tableName,
                    Key: {
                        pk: oldPk,
                        sk: id,
                    },
                })
                .promise();
            const params = {
                /* eslint-disable @typescript-eslint/naming-convention */
                TableName: tableName,
                Item: {
                    pk,
                    sk: id,
                    search_name: rightOldPkResult.search_name,
                    search_params: rightOldPkResult.search_params,
                    email_alert: enable,
                },
                /* eslint-enable @typescript-eslint/naming-convention */
            };
            await db.put(params).promise();
        } else {
            winston.info('updating saved job search', { id });
            await db
                .update({
                    TableName: tableName,
                    Key: {
                        pk: pk,
                        sk: id,
                    },
                    ExpressionAttributeValues: {
                        ':bool': enable,
                    },
                    UpdateExpression: 'SET email_alert = :bool',
                    ReturnValues: 'ALL_NEW',
                })
                .promise();
        }
        // We dont use this returned value for anything other than having a return value for graphql.
        // There is no undefined return type in graphql and null isnt a type rather a representation of a
        // lack of value. So common practise is to return something rather than nothing.
        return { enable };
    } catch (err) {
        winston.error('error received', { err });
        throw new Error('An error occured during update saved job search');
    }
};

const handlers = {
    parseCV: {
        inputCodec: ParseCVEvent,
        fn: async (input: ParseCVEvent, context: HandlerContext): Promise<DaxtraExtractedData> => {
            try {
                return await parseCV(input.args.filename, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    parseCVTemporary: {
        inputCodec: ParseCVTemporaryEvent,
        fn: async (input: ParseCVTemporaryEvent, context: HandlerContext): Promise<DaxtraExtractedData> => {
            try {
                return await parseCVTemporary(input.args.signedGetUrl, input.args.filetype, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getSignedUrl: {
        inputCodec: GetSignedUrlEvent,
        fn: async (input: GetSignedUrlEvent, context: HandlerContext): Promise<GetSignedUrlData> => {
            try {
                return await getSignedUrl(input.args.filename, input.args.filetype, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getSignedUrlTemporary: {
        inputCodec: GetSignedUrlTemporaryEvent,
        fn: async (input: GetSignedUrlTemporaryEvent, context: HandlerContext): Promise<GetSignedUrlData> => {
            try {
                return await getSignedUrlTemporary(input.args.filename, input.args.filetype, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getCvDownloadUrl: {
        inputCodec: GetCvDownloadUrlEvent,
        fn: async (input: GetCvDownloadUrlEvent, context: HandlerContext): Promise<GetCvDownloadUrlData> => {
            try {
                return await getCvDownloadUrl(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    saveJobSearch: {
        inputCodec: SaveJobSearchEvent,
        fn: async (input: SaveJobSearchEvent, context: HandlerContext): Promise<SavedJobSearchData> => {
            try {
                return await saveJobSearch(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getSavedJobSearches: {
        inputCodec: GetSavedJobSearchesEvent,
        fn: async (input: GetSavedJobSearchesEvent, context: HandlerContext): Promise<GetSavedJobSearchesData> => {
            try {
                return await getSavedJobSearches(input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    deleteSavedJobSearch: {
        inputCodec: DeleteSavedJobSearchEvent,
        fn: async (input: DeleteSavedJobSearchEvent, context: HandlerContext): Promise<DeleteSavedJobSearch> => {
            try {
                return await deleteSavedJobSearch(input.args.id, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    updateSavedJobSearch: {
        inputCodec: UpdateSavedJobSearchEvent,
        fn: async (input: UpdateSavedJobSearchEvent, context: HandlerContext): Promise<UpdateSavedJobSearchOutput> => {
            try {
                return await updateSavedJobSearch(input.args.id, input.args.enable, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getSkills: {
        inputCodec: GetSkillsEvent,
        fn: async (input: GetSkillsEvent, context: HandlerContext): Promise<ListSkillsResponse> => {
            try {
                return await getSkills(input, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getAccreditations: {
        inputCodec: GetAccreditationsEvent,
        fn: async (input: GetAccreditationsEvent, context: HandlerContext): Promise<ListAccreditationsResponse> => {
            try {
                return await getAccreditations(input, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getEmploymentPreferences: {
        inputCodec: GetEmploymentPreferencesEvent,
        fn: async (input: GetEmploymentPreferencesEvent, context: HandlerContext): Promise<ListEmploymentPreferencesResponse> => {
            try {
                return await getEmploymentPreferences(input, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    // Candidate Profile
    createCandidateProfile: {
        inputCodec: CreateCandidateProfileEvent,
        fn: async (input: CreateCandidateProfileEvent, context: HandlerContext): Promise<OutputProfile> => {
            try {
                winston.info('Creating candidate profile', {
                    cognitoUserUuid: input.identity.sub,
                    scrubbedCognitoIdentityEmail: scrubEmailAddress(input.identity.claims.email),
                });
                const response = await createCandidateProfile(input.args, input.identity, context);
                winston.info('Create candidate profile complete');
                return response;
            } catch (error) {
                winston.error('Create candidate profile errored', { error: serializeError(error) });
                return Promise.reject(new Error('An error occurred during createCandidateProfile'));
            }
        },
    },
    getCandidateProfile: {
        inputCodec: GetCandidateProfileEvent,
        fn: async (input: GetCandidateProfileEvent, context: HandlerContext): Promise<OutputProfile> => {
            try {
                winston.info('Getting candidate profile', {
                    cognitoUserUuid: input.identity.sub,
                    scrubbedCognitoIdentityEmail: scrubEmailAddress(input.identity.claims.email),
                });
                const response = await getCandidateProfile(input.args, input.identity, context);
                winston.info('Get candidate profile complete');
                return response;
            } catch (error) {
                winston.error('Get candidate profile errored', { error: serializeError(error) });
                return Promise.reject(new Error('An error occurred during getCandidateProfile'));
            }
        },
    },
    updateCandidateProfile: {
        inputCodec: UpdateCandidateProfileEvent,
        fn: async (input: UpdateCandidateProfileEvent, context: HandlerContext): Promise<OutputProfile> => {
            try {
                winston.info('Updating candidate profile', {
                    cognitoUserUuid: input.identity.sub,
                    scrubbedCognitoIdentityEmail: scrubEmailAddress(input.identity.claims.email),
                });
                const response = await updateCandidateProfile(input.args, input.identity, context);
                winston.info('Update candidate profile complete');
                return response;
            } catch (error) {
                winston.error('Update candidate profile errored', { error: serializeError(error) });
                return Promise.reject(new Error('An error occurred during updateCandidateProfile'));
            }
        },
    },
    // JobShortlist
    addJobToShortlist: {
        inputCodec: AddJobToShortlistEvent,
        fn: async (input: AddJobToShortlistEvent, context: HandlerContext): Promise<{ jobId: string }> => {
            try {
                return await addJobToShortlist(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getJobShortlist: {
        inputCodec: GetJobShortlistEvent,
        fn: async (input: GetJobShortlistEvent, context: HandlerContext): Promise<{ jobIds: string[] }> => {
            try {
                return await getJobShortlist(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    removeJobFromShortlist: {
        inputCodec: RemoveJobFromShortlistEvent,
        fn: async (input: RemoveJobFromShortlistEvent, context: HandlerContext): Promise<{ jobId: string }> => {
            try {
                return await removeJobFromShortlist(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    // Job Application Logs
    // Note we don't store any job details or statuses. The log is just used so that we can tell users what
    // they have previously applied to
    applyForJob: {
        inputCodec: ApplyForJobEvent,
        fn: async (input: ApplyForJobEvent, context: HandlerContext): Promise<{ jobId: string }> => {
            try {
                return await applyForJob(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getJobApplicationLogs: {
        inputCodec: GetJobApplicationLogsEvent,
        fn: async (input: GetJobApplicationLogsEvent, context: HandlerContext): Promise<{ jobIds: string[] }> => {
            try {
                return await getJobApplicationLogs(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
};

export default handlers;
