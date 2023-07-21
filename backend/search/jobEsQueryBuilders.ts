import { cond, equals, pick } from 'ramda';
import { GetJobSearchFacetCountsArgs, SearchJobsArgs, emptySearchJobsArgs } from './inputTypes';

const REFERENCE = 'reference';
const KEYWORD = 'keyword';
const LOCATION = 'location';
const ROLE = 'role';
const LEVEL = 'level';
const JOBTYPE = 'jobType';
const REMOTE = 'remote';
const SECURITY = 'security';
const ADDEDSINCE = 'addedSince';
const SALARYFROM = 'salaryFrom';
const SALARYTO = 'salaryTo';
const SALARYCURRENCY = 'salaryCurrency';
const PRODUCT = 'product';
const SEGMENT = 'segment';

type SearchJobKeys =
    | typeof REFERENCE
    | typeof KEYWORD
    | typeof LOCATION
    | typeof ROLE
    | typeof LEVEL
    | typeof JOBTYPE
    | typeof REMOTE
    | typeof SECURITY
    | typeof ADDEDSINCE
    | typeof SALARYFROM
    | typeof SALARYTO
    | typeof SALARYCURRENCY
    | typeof PRODUCT
    | typeof SEGMENT;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeSearchJobsMustQuery = (searchArgs: SearchJobsArgs, ignoreExpiryDate: boolean, brand: string): any[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mustQuerys: any[] = [];
    const productAndSegment: ['product', 'segment'] = ['product', 'segment'];
    const keys: Array<SearchJobKeys> = [
        REFERENCE,
        KEYWORD,
        LOCATION,
        ROLE,
        LEVEL,
        JOBTYPE,
        REMOTE,
        SECURITY,
        ADDEDSINCE,
        SALARYFROM,
        SALARYTO,
        SALARYCURRENCY,
        ...(brand === 'Nigel' ? productAndSegment : []),
    ];

    for (const entry of keys) {
        if (searchArgs[entry])
            cond([
                [
                    equals(REFERENCE),
                    (entry: typeof REFERENCE): void => {
                        const reference = searchArgs[entry];
                        if (reference) {
                            mustQuerys.push({
                                term: {
                                    reference: reference,
                                },
                            });
                        }
                    },
                ],
                [
                    equals(KEYWORD),
                    (entry: typeof KEYWORD): void => {
                        mustQuerys.push({
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            multi_match: {
                                query: searchArgs[entry],
                                fields: ['location.country', 'location.description', 'location.region', 'description', 'skills', 'title', 'role', 'seniority'],
                            },
                        });
                    },
                ],
                [
                    equals(LEVEL),
                    (entry: typeof LEVEL): void => {
                        const levels = searchArgs[entry];
                        if (levels && levels.length) {
                            mustQuerys.push({
                                terms: {
                                    seniority: levels,
                                },
                            });
                        }
                    },
                ],
                [
                    equals(JOBTYPE),
                    (entry: typeof JOBTYPE): void => {
                        if (searchArgs[entry] === 'contract') {
                            mustQuerys.push({
                                match: {
                                    type: 'Contract',
                                },
                            });
                        } else if (searchArgs[entry] === 'permanent') {
                            // New incoming broadbean Nigel jobs come through as 'Perm'
                            // Migrated jobs come through as 'Permanent'
                            if (brand === 'Nigel') {
                                mustQuerys.push({
                                    bool: {
                                        should: [{ match: { type: 'Permanent' } }, { match: { type: 'Perm' } }],
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        minimum_should_match: 1,
                                    },
                                });
                            } else {
                                mustQuerys.push({
                                    match: {
                                        type: 'Permanent',
                                    },
                                });
                            }
                        }
                    },
                ],
                [
                    equals(LOCATION),
                    (entry: typeof LOCATION): void => {
                        if (searchArgs[entry]) {
                            mustQuerys.push({
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                multi_match: {
                                    query: searchArgs[entry],
                                    fields: ['location.country', 'location.description', 'location.region'],
                                },
                            });
                        }
                    },
                ],
                [
                    equals(ROLE),
                    (entry: typeof ROLE): void => {
                        const roles = searchArgs[entry];
                        if (roles && roles.length) {
                            mustQuerys.push({
                                terms: {
                                    role: roles,
                                },
                            });
                        }
                    },
                ],
                [
                    equals(REMOTE),
                    (entry: typeof REMOTE): void => {
                        const remote = searchArgs[entry];
                        if (remote) {
                            mustQuerys.push({
                                term: {
                                    remote,
                                },
                            });
                        }
                    },
                ],
                [
                    equals(SECURITY),
                    (entry: typeof SECURITY): void => {
                        const security = searchArgs[entry];
                        if (security) {
                            mustQuerys.push({
                                term: {
                                    needsSecurityClearance: security,
                                },
                            });
                        }
                    },
                ],
                [
                    equals(ADDEDSINCE),
                    (entry: typeof ADDEDSINCE): void => {
                        const addedSince = searchArgs[entry];
                        if (addedSince) {
                            mustQuerys.push({
                                range: {
                                    lastModified: {
                                        gte: addedSince,
                                    },
                                },
                            });
                        }
                    },
                ],
                [
                    equals(SALARYCURRENCY),
                    (entry: typeof SALARYCURRENCY): void => {
                        const currency = searchArgs[entry];
                        if (currency) {
                            mustQuerys.push({
                                term: {
                                    'salary.currency': currency,
                                },
                            });
                        }
                    },
                ],
                [
                    equals(SALARYFROM),
                    (entry: typeof SALARYFROM): void => {
                        const from = searchArgs[entry];
                        if (from) {
                            mustQuerys.push({
                                range: {
                                    'salary.to': {
                                        gte: Number(from),
                                    },
                                },
                            });
                        }
                    },
                ],
                [
                    equals(SALARYTO),
                    (entry: typeof SALARYTO): void => {
                        const to = searchArgs[entry];
                        if (to) {
                            mustQuerys.push({
                                range: {
                                    'salary.from': {
                                        lte: Number(to),
                                    },
                                },
                            });
                        }
                    },
                ],
                [
                    equals(PRODUCT),
                    (entry: typeof PRODUCT): void => {
                        const product = searchArgs[entry];
                        if (product) {
                            mustQuerys.push({
                                term: {
                                    product: product,
                                },
                            });
                        }
                    },
                ],
                [
                    equals(SEGMENT),
                    (entry: typeof SEGMENT): void => {
                        const segment = searchArgs[entry];
                        if (segment) {
                            mustQuerys.push({
                                term: {
                                    segment: segment,
                                },
                            });
                        }
                    },
                ],
            ])(entry);
    }
    // this removes all expired jobs from the results
    if (!ignoreExpiryDate) {
        mustQuerys.push({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            range: {
                advertExpires: {
                    gte: new Date(),
                },
            },
        });
    }
    return mustQuerys;
};

type GetJobSearchFacetCountsKeys = typeof KEYWORD | typeof LOCATION | typeof JOBTYPE;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeJobSearchFacetCounts = (searchArgs: GetJobSearchFacetCountsArgs, ignoreExpiryDate: boolean, brand: string): any[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keys: Array<GetJobSearchFacetCountsKeys> = [KEYWORD, LOCATION, JOBTYPE];
    return makeSearchJobsMustQuery({ ...emptySearchJobsArgs, ...pick(keys, searchArgs) }, ignoreExpiryDate, brand);
};
