import * as t from 'io-ts';
import { optionalToUndefined } from '../shared/lambda-handler';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';

// SearchJobs
const SearchJobsArgs = t.type({
    reference: optionalToUndefined(t.string),
    keyword: optionalToUndefined(t.string),
    location: optionalToUndefined(t.string),
    jobType: optionalToUndefined(t.string), // Contract or Permanent or Both
    role: optionalToUndefined(t.array(t.string)),
    level: optionalToUndefined(t.array(t.string)), // Senior, Junior etc
    remote: optionalToUndefined(t.boolean),
    security: optionalToUndefined(t.boolean),
    page: optionalToUndefined(t.number),
    addedSince: optionalToUndefined(t.string),
    salaryFrom: optionalToUndefined(t.string),
    salaryTo: optionalToUndefined(t.string),
    salaryCurrency: optionalToUndefined(t.string),
    // nigel frank only
    product: optionalToUndefined(t.string),
    segment: optionalToUndefined(t.string),
});
export const emptySearchJobsArgs = {
    reference: undefined,
    keyword: undefined,
    location: undefined,
    jobType: undefined,
    role: undefined,
    level: undefined,
    remote: undefined,
    security: undefined,
    page: undefined,
    addedSince: undefined,
    salaryFrom: undefined,
    salaryTo: undefined,
    salaryCurrency: undefined,
    product: undefined,
    segment: undefined,
};
export type SearchJobsArgs = t.TypeOf<typeof SearchJobsArgs>;
export const SearchJobsInput = t.type({
    field: t.literal('searchJobs'),
    args: SearchJobsArgs,
});
export type SearchJobsInput = t.TypeOf<typeof SearchJobsInput>;

// getJobSearchFacetCounts
const GetJobSearchFacetCountsArgs = t.type({
    keyword: optionalToUndefined(t.string),
    location: optionalToUndefined(t.string),
    jobType: optionalToUndefined(t.string),
});
export type GetJobSearchFacetCountsArgs = t.TypeOf<typeof GetJobSearchFacetCountsArgs>;

export const GetJobSearchFacetCountsInput = t.type({
    field: t.literal('getJobSearchFacetCounts'),
    args: GetJobSearchFacetCountsArgs,
});
export type GetJobSearchFacetCountsInput = t.TypeOf<typeof GetJobSearchFacetCountsInput>;

// GetJob
const GetJobArgs = t.type({
    reference: t.string,
});
export const GetJobInput = t.type({
    field: t.literal('getJob'),
    args: GetJobArgs,
});
export type GetJobInput = t.TypeOf<typeof GetJobInput>;

// SearchCandidates
const SearchCandidatesArgs = t.type({
    keyword: optionalToUndefined(t.string),
    location: optionalToUndefined(t.string),
    jobType: optionalToUndefined(t.string),
    skills: optionalToUndefined(t.array(t.string)),
    jobTitles: optionalToUndefined(t.array(t.string)),
    levels: optionalToUndefined(t.array(t.string)),
    page: optionalToUndefined(t.number),
    addedSince: optionalToUndefined(t.string),
});
export const emptySearchCandidatesArgs = {
    keyword: undefined,
    location: undefined,
    jobType: undefined,
    skills: undefined,
    jobTitles: undefined,
    levels: undefined,
    page: undefined,
    addedSince: undefined,
};
export type SearchCandidatesArgs = t.TypeOf<typeof SearchCandidatesArgs>;
export const SearchCandidatesInput = t.type({
    field: t.literal('searchCandidates'),
    args: SearchCandidatesArgs,
});
export type SearchCandidatesInput = t.TypeOf<typeof SearchCandidatesInput>;

// getCandidateSearchFacets
const GetCandidateSearchFacetCountsArgs = t.type({
    keyword: optionalToUndefined(t.string),
    location: optionalToUndefined(t.string),
    jobType: optionalToUndefined(t.string),
});
export type GetCandidateSearchFacetCountsArgs = t.TypeOf<typeof GetCandidateSearchFacetCountsArgs>;
export const GetCandidateSearchFacetsInput = t.type({
    field: t.literal('getCandidateSearchFacets'),
    args: GetCandidateSearchFacetCountsArgs,
});
export type GetCandidateSearchFacetsInput = t.TypeOf<typeof GetCandidateSearchFacetsInput>;

// GetCandidate
const GetCandidateArgs = t.type({
    id: t.string,
});
export const GetCandidateInput = t.type({
    field: t.literal('getCandidate'),
    args: GetCandidateArgs,
});
export type GetCandidateInput = t.TypeOf<typeof GetCandidateInput>;

export const GetAllJobsForSitemapInput = t.type({
    field: t.literal('getAllJobsForSitemap'),
    args: t.type({}),
});
export type GetAllJobsForSitemapInput = t.TypeOf<typeof GetAllJobsForSitemapInput>;

export const GetAllJobsForIndeedSitemapInput = t.type({
    field: t.literal('getAllJobsForIndeedSitemap'),
    args: t.type({
        lastSearchJob: optionalToUndefined(
            t.type({
                lastModified: DateFromISOString,
                reference: t.string,
            }),
        ),
    }),
});
export type GetAllJobsForIndeedSitemapInput = t.TypeOf<typeof GetAllJobsForIndeedSitemapInput>;
