import * as appsync from '@aws-cdk/aws-appsync';
import * as cognito from '@aws-cdk/aws-cognito';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

interface AppSyncProps {
    readonly wordpressLambda: lambda.Function;
    readonly userPool: cognito.UserPool;
    readonly searchLambda: lambda.Function;
    readonly apiName: string;
    readonly candidateLambda: lambda.Function;
    readonly employerLambda: lambda.Function;
    readonly linkSiteVisitorToPardotAccountLambda: lambda.Function;
}

export class AppSync extends cdk.Construct {
    readonly api: appsync.GraphqlApi;

    constructor(scope: cdk.Construct, id: string, props: AppSyncProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'AppsyncAPI');

        const apiLambdas: Array<lambda.Function> = [];
        for (const propValue of Object.values(props)) {
            if (propValue instanceof lambda.Function) {
                apiLambdas.push(propValue);
            }
        }

        for (const apiLambda of apiLambdas) {
            const lambdaTags = cdk.Tags.of(apiLambda);
            lambdaTags.add('AppSyncAPILambda', 'yes');
        }

        this.api = new appsync.GraphqlApi(this, 'Api', {
            name: props.apiName,
            logConfig: {
                fieldLogLevel: appsync.FieldLogLevel.ERROR,
            },
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                },
                additionalAuthorizationModes: [
                    {
                        authorizationType: appsync.AuthorizationType.USER_POOL,
                        userPoolConfig: {
                            userPool: props.userPool,
                            defaultAction: appsync.UserPoolDefaultAction.ALLOW,
                        },
                    },
                ],
            },
            schema: new appsync.Schema({
                filePath: './lib/schema.graphql',
            }),
        });

        const wordpress = new appsync.LambdaDataSource(this, 'Wordpress', {
            api: this.api,
            lambdaFunction: props.wordpressLambda,
            name: 'WordpressLambda',
        });

        wordpress.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getContentPage"}'),
            fieldName: 'getContentPage',
            typeName: 'Query',
        });

        wordpress.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getBlogList"}'),
            fieldName: 'getBlogList',
            typeName: 'Query',
        });

        wordpress.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getBlogCategoryList"}'),
            fieldName: 'getBlogCategoryList',
            typeName: 'Query',
        });

        wordpress.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getSitemapBlogList"}'),
            fieldName: 'getSitemapBlogList',
            typeName: 'Query',
        });

        const search = new appsync.LambdaDataSource(this, 'Search', {
            api: this.api,
            lambdaFunction: props.searchLambda,
            name: 'SearchLambda',
        });

        search.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "searchJobs"}'),
            fieldName: 'searchJobs',
            typeName: 'Query',
        });

        search.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getJobSearchFacetCounts"}'),
            fieldName: 'getJobSearchFacetCounts',
            typeName: 'Query',
        });

        search.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getJob"}'),
            fieldName: 'getJob',
            typeName: 'Query',
        });

        search.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "searchCandidates"}'),
            fieldName: 'searchCandidates',
            typeName: 'Query',
        });
        search.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getCandidateSearchFacets"}'),
            fieldName: 'getCandidateSearchFacets',
            typeName: 'Query',
        });
        search.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getCandidate"}'),
            fieldName: 'getCandidate',
            typeName: 'Query',
        });
        search.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getAllJobsForSitemap"}'),
            fieldName: 'getAllJobsForSitemap',
            typeName: 'Query',
        });
        search.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getAllJobsForIndeedSitemap"}'),
            fieldName: 'getAllJobsForIndeedSitemap',
            typeName: 'Query',
        });

        const candidateProfile = new appsync.LambdaDataSource(this, 'CandidateProfile', {
            api: this.api,
            lambdaFunction: props.candidateLambda,
            name: 'CandidateProfile',
        });

        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "parseCV"}'),
            typeName: 'Query',
            fieldName: 'parseCV',
        });

        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "parseCVTemporary"}'),
            typeName: 'Query',
            fieldName: 'parseCVTemporary',
        });

        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getSignedUrl"}'),
            typeName: 'Query',
            fieldName: 'getSignedUrl',
        });

        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "field": "getSignedUrlTemporary"}'),
            typeName: 'Query',
            fieldName: 'getSignedUrlTemporary',
        });

        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getCvDownloadUrl"}'),
            typeName: 'Query',
            fieldName: 'getCvDownloadUrl',
        });

        /***** Job Searches ******/
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "saveJobSearch"}'),
            typeName: 'Query',
            fieldName: 'saveJobSearch',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getSavedJobSearches"}'),
            typeName: 'Query',
            fieldName: 'getSavedJobSearches',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "deleteSavedJobSearch"}'),
            typeName: 'Query',
            fieldName: 'deleteSavedJobSearch',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "updateSavedJobSearch"}'),
            typeName: 'Query',
            fieldName: 'updateSavedJobSearch',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity.sub), "field": "getSkills"}'),
            fieldName: 'getSkills',
            typeName: 'Query',
        });

        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity.sub), "field": "getAccreditations"}'),
            fieldName: 'getAccreditations',
            typeName: 'Query',
        });

        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(
                '{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity.sub), "field": "getEmploymentPreferences"}',
            ),
            fieldName: 'getEmploymentPreferences',
            typeName: 'Query',
        });

        /***** Candidate user profile ******/
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "createCandidateProfile"}'),
            typeName: 'Query',
            fieldName: 'createCandidateProfile',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getCandidateProfile"}'),
            typeName: 'Query',
            fieldName: 'getCandidateProfile',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "updateCandidateProfile"}'),
            typeName: 'Query',
            fieldName: 'updateCandidateProfile',
        });
        /***** Job shortlist ******/
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "addJobToShortlist"}'),
            typeName: 'Query',
            fieldName: 'addJobToShortlist',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "removeJobFromShortlist"}'),
            typeName: 'Query',
            fieldName: 'removeJobFromShortlist',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getJobShortlist"}'),
            typeName: 'Query',
            fieldName: 'getJobShortlist',
        });
        /***** Job Applications *****/
        // Note we don't store any job details or statuses. The log is just used so that we can tell users what
        // they have previously applied to
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "applyForJob"}'),
            typeName: 'Query',
            fieldName: 'applyForJob',
        });
        candidateProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getJobApplicationLogs"}'),
            typeName: 'Query',
            fieldName: 'getJobApplicationLogs',
        });

        const employerProfile = new appsync.LambdaDataSource(this, 'EmployerProfile', {
            api: this.api,
            lambdaFunction: props.employerLambda,
            name: 'EmployerProfile',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "createEmployerProfile"}'),
            typeName: 'Query',
            fieldName: 'createEmployerProfile',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getEmployerProfile"}'),
            typeName: 'Query',
            fieldName: 'getEmployerProfile',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "updateEmployerProfile"}'),
            typeName: 'Query',
            fieldName: 'updateEmployerProfile',
        });
        /***** Candidate shortlist ******/
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "addCandidateToShortlist"}'),
            typeName: 'Query',
            fieldName: 'addCandidateToShortlist',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(
                '{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "removeCandidateFromShortlist"}',
            ),
            typeName: 'Query',
            fieldName: 'removeCandidateFromShortlist',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getCandidateShortlist"}'),
            typeName: 'Query',
            fieldName: 'getCandidateShortlist',
        });
        /**** Employer Saved Searches *****/
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "saveCandidateSearch"}'),
            typeName: 'Query',
            fieldName: 'saveCandidateSearch',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getSavedCandidateSearches"}'),
            typeName: 'Query',
            fieldName: 'getSavedCandidateSearches',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "deleteSavedCandidateSearch"}'),
            typeName: 'Query',
            fieldName: 'deleteSavedCandidateSearch',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest('{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "updateSavedCandidateSearch"}'),
            typeName: 'Query',
            fieldName: 'updateSavedCandidateSearch',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(
                '{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "addEmployerResumeRequestsLogs"}',
            ),
            typeName: 'Query',
            fieldName: 'addEmployerResumeRequestsLogs',
        });
        employerProfile.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(
                '{"args": $util.toJson($context.args), "identity": $utils.toJson($context.identity), "field": "getEmployerResumeRequestsLogs"}',
            ),
            typeName: 'Query',
            fieldName: 'getEmployerResumeRequestsLogs',
        });
        // * Link Site Visitor To Pardot Account *//
        const linkSiteVisitorToPardotAccount = new appsync.LambdaDataSource(this, 'LinkSiteVisitorToPardotAccount', {
            api: this.api,
            lambdaFunction: props.linkSiteVisitorToPardotAccountLambda,
            name: 'LinkSiteVisitorToPardotAccount',
        });

        linkSiteVisitorToPardotAccount.createResolver({
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(
                '{"args": $util.toJson($context.args), "email": $utils.toJson($context.identity.claims.email), "field": "linkSiteVisitorToPardotAccount"}',
            ),
            typeName: 'Query',
            fieldName: 'linkSiteVisitorToPardotAccount',
        });
    }
}

export class AppSyncNestedStack extends cdk.NestedStack {
    readonly api: appsync.GraphqlApi;

    constructor(scope: cdk.Construct, id: string, props: AppSyncProps) {
        super(scope, id);
        const appsync = new AppSync(this, id, props);
        this.api = appsync.api;
    }
}
