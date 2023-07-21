import * as winston from 'winston';
import { Context } from './main';
import {
    SearchJobsInput,
    GetJobInput,
    GetJobSearchFacetCountsInput,
    SearchCandidatesInput,
    GetCandidateInput,
    GetCandidateSearchFacetsInput,
    GetAllJobsForSitemapInput,
    GetAllJobsForIndeedSitemapInput,
} from './inputTypes';
import { SearchJobsOutput, SearchCandidatesOutput, GetJobOutput, GetJobSearchFacetCountsOutput, GetCandidateOutput, GetCandidateSearchFacetsOutput, SitemapJob } from './outputTypes';
import getAwsESClient from './awsESClient';

export const handlers = {
    searchJobs: {
        inputCodec: SearchJobsInput,
        fn: (input: SearchJobsInput, context: Context): Promise<SearchJobsOutput> => {
            winston.info('Handling searchJobs', { input });
            const client = getAwsESClient(context.esEndpoint);
            return context.searchClient.searchJobs(input, client, context.ignoreExpiryDate, context.brand);
        },
    },
    getJobSearchFacetCounts: {
        inputCodec: GetJobSearchFacetCountsInput,
        fn: (input: GetJobSearchFacetCountsInput, context: Context): Promise<GetJobSearchFacetCountsOutput> => {
            winston.info('Handling GetJobSearchFacetCounts', { input });
            const client = getAwsESClient(context.esEndpoint);
            return context.searchClient.getJobSearchFacetCounts(input, client, context.ignoreExpiryDate, context.brand);
        },
    },
    getJob: {
        inputCodec: GetJobInput,
        fn: (input: GetJobInput, context: Context): Promise<GetJobOutput> => {
            winston.info('Handling getJob', { input });
            const client = getAwsESClient(context.esEndpoint);
            return context.searchClient.getJob(input, client, context.ignoreExpiryDate);
        },
    },
    searchCandidates: {
        inputCodec: SearchCandidatesInput,
        fn: (input: SearchCandidatesInput, context: Context): Promise<SearchCandidatesOutput> => {
            winston.info('Handling searchCandidates', { input });
            const client = getAwsESClient(context.esEndpoint);
            return context.searchClient.searchCandidates(input, client);
        },
    },
    getCandidateSearchFacets: {
        inputCodec: GetCandidateSearchFacetsInput,
        fn: (input: GetCandidateSearchFacetsInput, context: Context): Promise<GetCandidateSearchFacetsOutput> => {
            winston.info('Handling getCandidateSearchFacets', { input });
            const client = getAwsESClient(context.esEndpoint);
            return context.searchClient.getCandidateSearchFacets(input, client);
        },
    },
    getCandidate: {
        inputCodec: GetCandidateInput,
        fn: (input: GetCandidateInput, context: Context): Promise<GetCandidateOutput> => {
            winston.info('Handling getCandidate', { input });
            const client = getAwsESClient(context.esEndpoint);
            return context.searchClient.getCandidate(input, client);
        },
    },
    getAllJobsForSitemap: {
        inputCodec: GetAllJobsForSitemapInput,
        fn: (input: GetAllJobsForSitemapInput, context: Context): Promise<SitemapJob[]> => {
            winston.info('Handling getAllJobsForSitemap', { input });
            const client = getAwsESClient(context.esEndpoint);
            return context.searchClient.getAllJobsForSitemap(input, client, context.ignoreExpiryDate);
        },
    },
    getAllJobsForIndeedSitemap: {
        inputCodec: GetAllJobsForIndeedSitemapInput,
        fn: (input: GetAllJobsForIndeedSitemapInput, context: Context): Promise<SitemapJob[]> => {
            winston.info('Handling getAllJobsForIndeedSitemap', { input });
            const client = getAwsESClient(context.esEndpoint);
            return context.searchClient.getAllJobsForIndeedSitemap(input, client, context.ignoreExpiryDate);
        },
    },
};
