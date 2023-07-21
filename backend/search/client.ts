import { Client as ESClient, ApiResponse } from '@elastic/elasticsearch';
import { isLeft } from 'fp-ts/lib/Either';
import { assocPath, filter, forEach, map, pluck, replace, last } from 'ramda';
import * as winston from 'winston';
import { makeCandidateSearchFacetsMustQueries, makeCandidateSearchMustQueries } from './candidateEsQueryBuilders';
import {
    emptySearchCandidatesArgs,
    emptySearchJobsArgs,
    GetAllJobsForSitemapInput,
    GetCandidateInput,
    GetCandidateSearchFacetsInput,
    GetJobInput,
    GetJobSearchFacetCountsInput,
    SearchCandidatesInput,
    SearchJobsInput,
    GetAllJobsForIndeedSitemapInput,
} from './inputTypes';
import { makeJobSearchFacetCounts, makeSearchJobsMustQuery } from './jobEsQueryBuilders';
import {
    CandidateSearchFacetList,
    CandidateSearchFacetNew,
    GetCandidateOutput,
    GetCandidateSearchFacetsOutput,
    GetJobOutput,
    GetJobSearchFacetCountsOutput,
    isCandidate,
    isJob,
    isJobSearchFacetCurrency,
    isJobSearchFacetNew,
    IsJobSearchFacetNew,
    isJobSearchFacetRolesOrLevels,
    isJobSearchFacetSecurityOrRemote,
    IsJobSearchFacetSecurityOrRemote,
    SearchCandidatesOutput,
    SearchJobsOutput,
    SitemapJob,
    SitemapJobResults,
    IndeedSitemapJob,
    IndeedSitemapJobResults,
} from './outputTypes';
import {
    dummyHandleGetAllJobsForIndeedSitemap,
    dummyHandleGetAllJobsForSitemap,
    dummyHandleGetCandidate,
    dummyHandleGetCandidateSearchFacets,
    dummyHandleGetJob,
    dummyhandleGetJobSearchFacetCounts,
    dummyHandleSearchCandidates,
    dummyHandleSearchJobs,
} from './sampleData/dummyHandlers';

export interface SearchClient {
    searchJobs: (params: SearchJobsInput, client: ESClient, ignoreExpiryDate: boolean, brand: string) => Promise<SearchJobsOutput>;
    getJob: (params: GetJobInput, client: ESClient, ignoreExpiryDate: boolean) => Promise<GetJobOutput>;
    getJobSearchFacetCounts: (params: GetJobSearchFacetCountsInput, client: ESClient, ignoreExpiryDate: boolean, brand: string) => Promise<GetJobSearchFacetCountsOutput>;
    searchCandidates: (params: SearchCandidatesInput, client: ESClient) => Promise<SearchCandidatesOutput>;
    getCandidateSearchFacets: (params: GetCandidateSearchFacetsInput, client: ESClient) => Promise<GetCandidateSearchFacetsOutput>;
    getCandidate: (params: GetCandidateInput, client: ESClient) => Promise<GetCandidateOutput>;
    getAllJobsForSitemap: (params: GetAllJobsForSitemapInput, client: ESClient, ignoreExpiryDate: boolean) => Promise<SitemapJob[]>;
    getAllJobsForIndeedSitemap: (params: GetAllJobsForIndeedSitemapInput, client: ESClient, ignoreExpiryDate: boolean) => Promise<IndeedSitemapJob[]>;
}

const JOBS_INDEX_NAME = 'jobs';
const CANDIDATES_INDEX_NAME = 'candidates';

const doJobSearch = async (input: SearchJobsInput, client: ESClient, ignoreExpiryDate: boolean, brand: string): Promise<SearchJobsOutput> => {
    const mustQuerys = makeSearchJobsMustQuery(input.args, ignoreExpiryDate, brand);
    const data = await client.search({
        index: JOBS_INDEX_NAME,
        body: {
            query: {
                bool: {
                    must: mustQuerys,
                },
            },
            from: input.args.page ? (input.args.page - 1) * 10 : 0,
        },
    });
    const isJobs = isJob.decode(data.body.hits);
    if (isLeft(isJobs)) {
        throw new Error('Unable to load job data from JSON, invalid data shape');
    }
    const itemsWithBbid = map(jobDoc => ({ ...jobDoc._source, bbid: jobDoc._id }), isJobs.right.hits);
    return { items: itemsWithBbid, pagination: isJobs.right.total };
};
export const handleSearchJobs = async (input: SearchJobsInput, client: ESClient, ignoreExpiryDate: boolean, brand: string): Promise<SearchJobsOutput> => {
    try {
        const originalSearchResults = await doJobSearch(input, client, ignoreExpiryDate, brand);
        if (originalSearchResults.items && originalSearchResults.items.length) {
            return originalSearchResults;
        }

        // Due to the way we are tokenising location stuff, "Chicago, Illinois" returns results but "Chicago Illinois"
        // does not return anything (because of the missing comma). If a search returned with empty results and a location
        // was provided then retry with commas to see if anything comes back. We don't try with commas immediately because
        // that would break terms like "New York" and "Greater Manchester"
        if (input.args.location) {
            const newLocationQuery = replace(' ', ',', input.args.location);
            const retrySearch = await doJobSearch(assocPath(['args', 'location'], newLocationQuery, input), client, ignoreExpiryDate, brand);
            return retrySearch;
        }

        return originalSearchResults;
    } catch (err) {
        throw err;
    }
};

const doGetJobSearchFacets = async (input: GetJobSearchFacetCountsInput, client: ESClient, ignoreExpiryDate: boolean, brand: string): Promise<GetJobSearchFacetCountsOutput> => {
    const mustQuerys = makeJobSearchFacetCounts(input.args, ignoreExpiryDate, brand);
    const data = await client.search({
        index: JOBS_INDEX_NAME,
        body: {
            query: {
                bool: {
                    must: mustQuerys,
                },
            },
            aggs: {
                roles: {
                    terms: { field: 'role' },
                },
                levels: {
                    terms: { field: 'seniority' },
                },
                security: {
                    terms: { field: 'needsSecurityClearance' },
                },
                remote: {
                    terms: { field: 'remote' },
                },
                new: {
                    range: {
                        field: 'lastModified',
                        ranges: [
                            {
                                from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                            },
                        ],
                    },
                },
                currency: {
                    terms: { field: 'salary.currency' },
                },
            },
        },
    });
    const isJobsSearchFacetRoles = isJobSearchFacetRolesOrLevels.decode(data.body.aggregations.roles.buckets);
    if (isLeft(isJobsSearchFacetRoles)) {
        throw new Error('Unable to load job roles data from JSON, invalid data shape');
    }
    const isJobsSearchFacetLevels = isJobSearchFacetRolesOrLevels.decode(data.body.aggregations.levels.buckets);
    if (isLeft(isJobsSearchFacetLevels)) {
        throw new Error('Unable to load job levels data from JSON, invalid data shape');
    }
    const isJobsSearchFacetSecurity = isJobSearchFacetSecurityOrRemote.decode(data.body.aggregations.security.buckets);
    if (isLeft(isJobsSearchFacetSecurity)) {
        throw new Error('Unable to load job security data from JSON, invalid data shape');
    }
    const isJobsSearchFacetRemote = isJobSearchFacetSecurityOrRemote.decode(data.body.aggregations.remote.buckets);
    if (isLeft(isJobsSearchFacetRemote)) {
        throw new Error('Unable to load job remote data from JSON, invalid data shape');
    }
    const isJobsSearchFacetNew = isJobSearchFacetNew.decode(data.body.aggregations.new.buckets);
    if (isLeft(isJobsSearchFacetNew)) {
        throw new Error('Unable to load job new data from JSON, invalid data shape');
    }
    const isJobsSearchFacetCurrency = isJobSearchFacetCurrency.decode(data.body.aggregations.currency.buckets);
    if (isLeft(isJobsSearchFacetCurrency)) {
        throw new Error('Unable to load job new data from JSON, invalid data shape');
    }

    const roles = map(
        item => ({
            key: item.key,
            docCount: item.doc_count,
        }),
        isJobsSearchFacetRoles.right,
    );

    const levels = map(
        item => ({
            key: item.key,
            docCount: item.doc_count,
        }),
        isJobsSearchFacetLevels.right,
    );

    // both this and remomte are boolean fields, their data is reshaped
    // here to be closer to that of the string fields
    // the "false" cases are filted out as the dont case about them
    const security = map(
        item => ({
            key: 'Security clearance',
            docCount: item.doc_count,
            value: 'security',
        }),
        filter<IsJobSearchFacetSecurityOrRemote>(item => !!item.key, isJobsSearchFacetSecurity.right),
    );

    const remote = map(
        item => ({
            key: 'Remote jobs',
            docCount: item.doc_count,
            value: 'remote',
        }),
        filter<IsJobSearchFacetSecurityOrRemote>(item => !!item.key, isJobsSearchFacetRemote.right),
    );

    const newJobs = map(
        item => ({
            key: 'New jobs',
            docCount: item.doc_count,
            value: 'newJobs',
        }),
        filter<IsJobSearchFacetNew>(item => !!item.doc_count, isJobsSearchFacetNew.right),
    );

    const currencies = map(
        item => ({
            key: item.key,
            docCount: item.doc_count,
        }),
        isJobsSearchFacetCurrency.right,
    );

    return {
        roles,
        levels,
        security,
        remote,
        newJobs,
        currencies,
    };
};
export const handleGetJobSearchFacetCounts = async (input: GetJobSearchFacetCountsInput, client: ESClient, ignoreExpiryDate: boolean, brand: string): Promise<GetJobSearchFacetCountsOutput> => {
    try {
        const originalSearchResults = await doJobSearch({ field: 'searchJobs', args: { ...emptySearchJobsArgs, ...input.args } }, client, ignoreExpiryDate, brand);
        // If search returned results then get facets for search
        if (originalSearchResults.items && originalSearchResults.items.length) {
            const originalFacetResults = await doGetJobSearchFacets(input, client, ignoreExpiryDate, brand);
            return originalFacetResults;
        }

        // Need to match the behaviour in handleSearchJobs so we get the right facets back!
        const newLocationQuery = replace(' ', ',', input.args.location || '');
        const retryFacetResults = await doGetJobSearchFacets(assocPath(['args', 'location'], newLocationQuery, input), client, ignoreExpiryDate, brand);
        return retryFacetResults;
    } catch (err) {
        throw err;
    }
};

export const handleGetJob = async (input: GetJobInput, client: ESClient, ignoreExpiryDate: boolean): Promise<GetJobOutput> => {
    const reference = input.args.reference;

    const getJobQuery = {
        ...(ignoreExpiryDate
            ? {
                  match: { reference },
              }
            : {
                  bool: {
                      must: [
                          {
                              range: {
                                  advertExpires: {
                                      gte: new Date(),
                                  },
                              },
                          },
                          {
                              match: { reference },
                          },
                      ],
                  },
              }),
    };

    try {
        const data = await client.search({
            index: JOBS_INDEX_NAME,
            body: {
                query: getJobQuery,
            },
        });
        const isJobs = isJob.decode(data.body.hits);
        if (isLeft(isJobs)) {
            throw new Error('Unable to load job data from JSON, invalid data shape');
        }
        if (isJobs.right.hits && isJobs.right.hits.length) {
            return isJobs.right.hits[0]._source;
        }
        return undefined;
    } catch (err) {
        throw err;
    }
};

const doCandidateSearch = async (input: SearchCandidatesInput, client: ESClient): Promise<SearchCandidatesOutput> => {
    const mustQuerys = makeCandidateSearchMustQueries(input.args);
    const data = await client.search({
        index: CANDIDATES_INDEX_NAME,
        body: {
            query: {
                bool: {
                    must: mustQuerys,
                },
            },
            from: input.args.page ? (input.args.page - 1) * 10 : 0,
        },
    });

    const isCandidates = isCandidate.decode(data.body.hits);
    if (isLeft(isCandidates)) {
        throw new Error('Unable to load job data from JSON, invalid data shape');
    }
    const items = pluck('_source', isCandidates.right.hits);
    return { items: items, pagination: isCandidates.right.total };
};
export const handleSearchCandidates = async (input: SearchCandidatesInput, client: ESClient): Promise<SearchCandidatesOutput> => {
    try {
        const originalSearchResults = await doCandidateSearch(input, client);
        if (originalSearchResults.items && originalSearchResults.items.length) {
            return originalSearchResults;
        }

        // Due to the way we are tokenising location stuff, "Chicago, Illinois" returns results but "Chicago Illinois"
        // does not return anything (because of the missing comma). If a search returned with empty results and a location
        // was provided then retry with commas to see if anything comes back. We don't try with commas immediately because
        // that would break terms like "New York" and "Greater Manchester"
        if (input.args.location) {
            const newLocationQuery = replace(' ', ',', input.args.location);
            const retrySearch = await doCandidateSearch(assocPath(['args', 'location'], newLocationQuery, input), client);
            return retrySearch;
        }

        return originalSearchResults;
    } catch (err) {
        throw err;
    }
};

const doGetCandidateSearchFacets = async (input: GetCandidateSearchFacetsInput, client: ESClient): Promise<GetCandidateSearchFacetsOutput> => {
    const mustQuerys = makeCandidateSearchFacetsMustQueries(input.args);
    const data = await client.search({
        index: CANDIDATES_INDEX_NAME,
        body: {
            query: {
                bool: {
                    must: mustQuerys,
                },
            },
            aggs: {
                skills: {
                    terms: { field: 'skills.name.raw', size: 15 },
                },
                jobTitles: {
                    terms: { field: 'jobTitle', size: 15 },
                },
                levels: {
                    terms: { field: 'level', size: 15 },
                },
                new: {
                    range: {
                        field: 'lastModified',
                        ranges: [
                            {
                                from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                            },
                        ],
                    },
                },
            },
        },
    });
    winston.info('handleGetCandidateSearchFacets data', { data });
    const skillsAggregation = CandidateSearchFacetList.decode(data.body.aggregations.skills.buckets);
    if (isLeft(skillsAggregation)) {
        throw new Error('Unable to load candidate search facet data from JSON, invalid data shape');
    }
    const skills = map(
        item => ({
            key: item.key,
            docCount: item.doc_count,
        }),
        skillsAggregation.right,
    );

    const jobTitlesAggregation = CandidateSearchFacetList.decode(data.body.aggregations.jobTitles.buckets);
    if (isLeft(jobTitlesAggregation)) {
        throw new Error('Unable to load candidate search facet data from JSON, invalid data shape');
    }
    const jobTitles = map(
        item => ({
            key: item.key,
            docCount: item.doc_count,
        }),
        jobTitlesAggregation.right,
    );

    const levelsAggregation = CandidateSearchFacetList.decode(data.body.aggregations.levels.buckets);
    if (isLeft(levelsAggregation)) {
        throw new Error('Unable to load candidate search facet data from JSON, invalid data shape');
    }
    const levels = map(
        item => ({
            key: item.key,
            docCount: item.doc_count,
        }),
        levelsAggregation.right,
    );

    const newAggregation = CandidateSearchFacetNew.decode(data.body.aggregations.new.buckets);
    if (isLeft(newAggregation)) {
        throw new Error('Unable to load job new data from JSON, invalid data shape');
    }

    const newCandidates = map(
        item => ({
            key: 'New Candidates',
            docCount: item.doc_count,
            value: 'newCandidates',
        }),
        newAggregation.right,
    );

    return {
        skills,
        jobTitles,
        levels,
        newCandidates,
    };
};
const handleGetCandidateSearchFacets = async (input: GetCandidateSearchFacetsInput, client: ESClient): Promise<GetCandidateSearchFacetsOutput> => {
    try {
        // If search returned results then get facets for search
        const originalSearchResults = await doCandidateSearch({ field: 'searchCandidates', args: { ...emptySearchCandidatesArgs, ...input.args } }, client);
        if (originalSearchResults.items && originalSearchResults.items.length) {
            const originalFacetResults = await doGetCandidateSearchFacets(input, client);
            return originalFacetResults;
        }

        // Need to match the behaviour in handleSearchCandidates so we get the right facets back!
        const newLocationQuery = replace(' ', ',', input.args.location || '');
        const retryFacetResults = await doGetCandidateSearchFacets(assocPath(['args', 'location'], newLocationQuery, input), client);
        return retryFacetResults;
    } catch (err) {
        throw err;
    }
};

export const handleGetCandidate = async (input: GetCandidateInput, client: ESClient): Promise<GetCandidateOutput> => {
    try {
        const { id } = input.args;
        const data = await client.search({
            index: CANDIDATES_INDEX_NAME,
            body: {
                query: { match: { id } },
            },
        });
        const isCandidates = isCandidate.decode(data.body.hits);
        if (isLeft(isCandidates)) {
            throw new Error('Unable to load job data from JSON, invalid data shape');
        }
        if (isCandidates.right.hits && isCandidates.right.hits.length) {
            return isCandidates.right.hits[0]._source;
        }
        return undefined;
    } catch (err) {
        throw err;
    }
};

export const handleGetAllJobsForSitemap = async (input: GetAllJobsForSitemapInput, client: ESClient, ignoreExpiryDate: boolean): Promise<SitemapJob[]> => {
    try {
        let jobs: SitemapJob[] = [];

        let lastSearchKey;

        const getAllJobsForSitemapQuery = {
            ...(ignoreExpiryDate
                ? {
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      match_all: {},
                  }
                : {
                      bool: {
                          must: [
                              {
                                  range: {
                                      advertExpires: {
                                          gte: new Date(),
                                      },
                                  },
                              },
                              {
                                  // eslint-disable-next-line @typescript-eslint/naming-convention
                                  match_all: {},
                              },
                          ],
                      },
                  }),
        };
        do {
            const jobMatchAllResults: ApiResponse = await client.search({
                /* eslint-disable @typescript-eslint/naming-convention */
                index: JOBS_INDEX_NAME,
                size: 5000,
                body: { query: getAllJobsForSitemapQuery, search_after: lastSearchKey },
                _source: ['lastModified', 'reference', 'title'],
                sort: ['lastModified', 'reference'],
                /* eslint-enable @typescript-eslint/naming-convention */
            });
            const maybeJobDocuments = SitemapJobResults.decode(jobMatchAllResults.body.hits);
            if (isLeft(maybeJobDocuments)) {
                winston.error('Unable to load job data from JSON, invalid data shape', jobMatchAllResults.body.hits);
                throw new Error('Unable to load job data from JSON, invalid data shape');
            }
            const jobDocuments = maybeJobDocuments.right;
            if (jobDocuments.hits && jobDocuments.hits.length) {
                forEach(({ _source }) => {
                    jobs = [...jobs, _source];
                }, jobDocuments.hits);
            }

            lastSearchKey = last(jobDocuments.hits)?.sort;
        } while (lastSearchKey);

        return jobs;
    } catch (err) {
        throw err;
    }
};

export const handleGetAllJobsForIndeedSitemap = async (input: GetAllJobsForIndeedSitemapInput, client: ESClient, ignoreExpiryDate: boolean): Promise<IndeedSitemapJob[]> => {
    const getAllJobsForIndeedSitemapQuery = {
        ...(ignoreExpiryDate
            ? {
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  match_all: {},
              }
            : {
                  bool: {
                      must: [
                          {
                              range: {
                                  advertExpires: {
                                      gte: new Date(),
                                  },
                              },
                          },
                          {
                              // eslint-disable-next-line @typescript-eslint/naming-convention
                              match_all: {},
                          },
                      ],
                  },
              }),
    };
    try {
        const lastSearchJob = input.args.lastSearchJob ? [input.args.lastSearchJob.lastModified.getTime(), input.args.lastSearchJob.reference] : undefined;
        const jobMatchAllResults: ApiResponse = await client.search({
            /* eslint-disable @typescript-eslint/naming-convention */
            index: JOBS_INDEX_NAME,
            size: 750, // We're returning the descriptions of jobs as well so we should limit this to not go over the lambda response limit
            body: { query: getAllJobsForIndeedSitemapQuery, search_after: lastSearchJob },
            _source: ['title', 'lastModified', 'reference', 'location', 'description', 'salary', 'type'],
            sort: ['lastModified', 'reference'],
            /* eslint-enable @typescript-eslint/naming-convention */
        });
        const maybeJobDocuments = IndeedSitemapJobResults.decode(jobMatchAllResults.body.hits);
        if (isLeft(maybeJobDocuments)) {
            winston.error('Unable to load job data from JSON, invalid data shape', jobMatchAllResults.body.hits);
            throw new Error('Unable to load job data from JSON, invalid data shape');
        }
        const jobDocuments = maybeJobDocuments.right;
        if (jobDocuments.hits && jobDocuments.hits.length) {
            return map(hit => hit._source, jobDocuments.hits);
        }
        return [];
    } catch (err) {
        throw err;
    }
};

export const getSearchClient = (useDummyData: boolean): SearchClient => {
    if (useDummyData)
        return {
            searchJobs: dummyHandleSearchJobs,
            getJob: dummyHandleGetJob,
            getJobSearchFacetCounts: dummyhandleGetJobSearchFacetCounts,
            searchCandidates: dummyHandleSearchCandidates,
            getCandidateSearchFacets: dummyHandleGetCandidateSearchFacets,
            getCandidate: dummyHandleGetCandidate,
            getAllJobsForSitemap: dummyHandleGetAllJobsForSitemap,
            getAllJobsForIndeedSitemap: dummyHandleGetAllJobsForIndeedSitemap,
        };
    else
        return {
            searchJobs: handleSearchJobs,
            getJob: handleGetJob,
            getJobSearchFacetCounts: handleGetJobSearchFacetCounts,
            searchCandidates: handleSearchCandidates,
            getCandidateSearchFacets: handleGetCandidateSearchFacets,
            getCandidate: handleGetCandidate,
            getAllJobsForSitemap: handleGetAllJobsForSitemap,
            getAllJobsForIndeedSitemap: handleGetAllJobsForIndeedSitemap,
        };
};
