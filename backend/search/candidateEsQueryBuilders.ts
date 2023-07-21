// Disabling this because everything here returns elasticsearch query shaped things
/* eslint-disable @typescript-eslint/no-explicit-any */
import { equals, reduce, cond, keys, T, always, contains, __, filter, map } from 'ramda';
import { SearchCandidatesArgs, GetCandidateSearchFacetCountsArgs } from './inputTypes';

const KEYWORD = 'keyword';
const LOCATION = 'location';
const JOB_TYPE = 'jobType';
const SKILLS = 'skills';
const JOB_TITLES = 'jobTitles';
const LEVELS = 'levels';
const ADDEDSINCE = 'addedSince';

const makeKeywordQuery = (value: string): any => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    multi_match: {
        query: value,
        fields: ['location.description', 'profile.raw', 'skills.name', 'jobTitle', 'advertTitle'],
    },
});

const makeLocationQuery = (value: string): any => ({
    match: {
        'location.description': {
            query: value,
        },
    },
});

const makeJobTypeQuery = cond<string, any>([
    [
        equals('contract'),
        always({
            bool: {
                should: [{ match: { type: 'Contract' } }, { match: { type: 'Perm_Contract' } }],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                minimum_should_match: 1,
            },
        }),
    ],
    [
        equals('permanent'),
        always({
            bool: {
                should: [{ match: { type: 'Permanent' } }, { match: { type: 'Perm_Contract' } }],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                minimum_should_match: 1,
            },
        }),
    ],
    [T, always(undefined)],
]);

const makeSkillsQuery = (value: string[]): any =>
    value.length
        ? {
              bool: {
                  must: [map(skill => ({ term: { 'skills.name': skill } }), value)],
              },
          }
        : undefined;

const makeJobTitlesQuery = (value: string[]): any =>
    value.length
        ? {
              terms: {
                  jobTitle: value,
              },
          }
        : undefined;

const makeLevelsQuery = (value: string[]): any =>
    value.length
        ? {
              terms: {
                  level: value,
              },
          }
        : undefined;

const makeAddedSinceQuery = (value: string): any => ({
    range: {
        lastModified: {
            gte: value,
        },
    },
});

export const makeCandidateSearchMustQueries = (args: SearchCandidatesArgs, explicitKeys: string[] = []): any[] => {
    const queries = reduce<keyof SearchCandidatesArgs, any[]>(
        (currentQuery, searchParam) => {
            const query = cond<string, any | undefined>([
                [equals(KEYWORD), (): any | undefined => (args.keyword ? makeKeywordQuery(args.keyword) : undefined)],
                [equals(LOCATION), (): any | undefined => (args.location ? makeLocationQuery(args.location) : undefined)],
                [equals(JOB_TYPE), (): any | undefined => (args.jobType ? makeJobTypeQuery(args.jobType) : undefined)],
                [equals(SKILLS), (): any | undefined => (args.skills ? makeSkillsQuery(args.skills) : undefined)],
                [equals(JOB_TITLES), (): any | undefined => (args.jobTitles ? makeJobTitlesQuery(args.jobTitles) : undefined)],
                [equals(LEVELS), (): any | undefined => (args.levels ? makeLevelsQuery(args.levels) : undefined)],
                [equals(ADDEDSINCE), (): any | undefined => (args.addedSince ? makeAddedSinceQuery(args.addedSince) : undefined)],
                [T, always(undefined)],
            ])(searchParam);

            if (query) {
                return [...currentQuery, query];
            }
            return [...currentQuery];
        },
        [],
        explicitKeys.length ? filter(contains(__, explicitKeys), keys(args)) : keys(args),
    );
    return queries;
};

export const makeCandidateSearchFacetsMustQueries = (args: GetCandidateSearchFacetCountsArgs): any[] => {
    // I have to pass these in as undefined for typescript to be happy.
    // If there is a moment I will come back and fix this :(
    return makeCandidateSearchMustQueries({ ...args, skills: undefined, jobTitles: undefined, levels: undefined, page: undefined, addedSince: undefined }, [KEYWORD, LOCATION, JOB_TYPE]);
};
