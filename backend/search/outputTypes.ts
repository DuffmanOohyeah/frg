import * as t from 'io-ts';
import { optionalToUndefined } from '../shared/lambda-handler';
import { pick } from 'ramda';

export interface SearchJobsOutput {
    items: Array<Job>;
    pagination: Pagination;
}

export interface SearchCandidatesOutput {
    items: Array<Candidate>;
    pagination: Pagination;
}

export type GetJobOutput = Job | undefined;

export const isJobSearchFacetRolesOrLevels = t.array(
    t.type({
        key: t.string,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        doc_count: t.number,
    }),
);

export const isJobSearchFacetSecurityOrRemote = t.array(
    t.type({
        key: t.number,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        doc_count: t.number,
        // this is never used in the code but its returned from the api
        // eslint-disable-next-line @typescript-eslint/naming-convention
        key_as_string: t.string,
    }),
);

export const isJobSearchFacetNew = t.array(
    t.type({
        key: t.string,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        doc_count: t.number,
        from: t.number,
    }),
);

export const isJobSearchFacetCurrency = t.array(
    t.type({
        key: t.string,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        doc_count: t.number,
    }),
);

export interface IsJobSearchFacetSecurityOrRemote {
    /* eslint-disable @typescript-eslint/naming-convention */
    key: number;
    doc_count: number;
    key_as_string: string;
    /* eslint-enable @typescript-eslint/naming-convention */
}

export interface IsJobSearchFacetNew {
    /* eslint-disable @typescript-eslint/naming-convention */
    key: string;
    doc_count: number;
    from: number;
    /* eslint-enable @typescript-eslint/naming-convention */
}

type RolesSearchFacetOutput = { key: string; docCount: number }[];
type LevelsSearchFacetOutput = { key: string; docCount: number }[];
type SecuritySearchFacetOutput = { key: string; docCount: number }[];
type RemoteSearchFacetOutput = { key: string; docCount: number }[];
type NewSearchFacetOutput = { key: string; docCount: number; value: string }[];
type CurrenciesSearchFacetOutput = { key: string; docCount: number }[];

export type GetJobSearchFacetCountsOutput = {
    roles: RolesSearchFacetOutput;
    levels: LevelsSearchFacetOutput;
    security: SecuritySearchFacetOutput;
    remote: RemoteSearchFacetOutput;
    newJobs: NewSearchFacetOutput;
    currencies: CurrenciesSearchFacetOutput;
};

export type GetCandidateOutput = Candidate | undefined;

export interface Pagination {
    value: number;
    relation: string;
}

export const Job = t.type({
    indexedAt: t.string,
    lastModified: t.string,
    contactName: t.string,
    contactEmail: t.string,
    applicationEmail: t.string,
    reference: t.string,
    title: t.string,
    type: t.string,
    skills: t.array(t.string),
    description: t.string,
    product: optionalToUndefined(t.string),
    segment: optionalToUndefined(t.string),
    role: t.string,
    remote: t.boolean,
    needsSecurityClearance: t.boolean,
    seniority: t.string,
    location: t.type({
        description: t.string,
        country: t.string,
        region: t.string,
    }),
    salary: t.type({
        from: optionalToUndefined(t.number),
        to: optionalToUndefined(t.number),
        currency: t.string,
        description: t.string,
    }),
});
export type Job = t.TypeOf<typeof Job>;

export const isJob = t.type({
    /* eslint-disable @typescript-eslint/naming-convention */
    hits: t.array(t.type({ _source: Job, _index: t.string, _type: t.string, _id: t.string, _score: t.number })),
    total: t.type({ value: t.number, relation: t.string }),
    max_score: t.union([t.number, t.null]),
    /* eslint-enable @typescript-eslint/naming-convention */
});

export const SitemapJob = t.type(pick(['lastModified', 'reference', 'title'], Job.props));
export type SitemapJob = t.TypeOf<typeof SitemapJob>;
export const SitemapJobResults = t.type({
    /* eslint-disable @typescript-eslint/naming-convention */
    hits: t.array(t.type({ _source: SitemapJob, _index: t.string, _type: t.string, _id: t.string, sort: t.array(t.union([t.string, t.number])) })),
    total: t.type({ value: t.number, relation: t.string }),
    max_score: t.union([t.number, t.null]),
    /* eslint-enable @typescript-eslint/naming-convention */
});
export type SitemapJobResults = t.TypeOf<typeof SitemapJobResults>;

export const IndeedSitemapJob = t.type(pick(['title', 'lastModified', 'reference', 'location', 'description', 'salary', 'type'], Job.props));
export type IndeedSitemapJob = t.TypeOf<typeof SitemapJob>;
export const IndeedSitemapJobResults = t.type({
    /* eslint-disable @typescript-eslint/naming-convention */
    hits: t.array(t.type({ _source: IndeedSitemapJob, _index: t.string, _type: t.string, _id: t.string, sort: t.array(t.union([t.string, t.number])) })),
    total: t.type({ value: t.number, relation: t.string }),
    max_score: t.union([t.number, t.null]),
    /* eslint-enable @typescript-eslint/naming-convention */
});
export type IndeedSitemapJobResults = t.TypeOf<typeof IndeedSitemapJobResults>;

export const Candidate = t.type({
    id: t.string,
    indexedAt: t.string,
    lastModified: t.string,
    salary: t.type({
        currency: optionalToUndefined(t.string),
        normalised: optionalToUndefined(t.number),
        amount: optionalToUndefined(t.number),
        description: optionalToUndefined(t.string),
    }),
    recruiter: t.type({
        phone: optionalToUndefined(t.string),
        name: t.string,
        email: t.string,
    }),
    location: t.type({ description: t.string }),
    willingToWorkRemotely: optionalToUndefined(t.boolean),
    willingToRelocate: optionalToUndefined(t.boolean),
    type: optionalToUndefined(t.string),
    skills: optionalToUndefined(
        t.array(
            t.type({
                yearsExperience: optionalToUndefined(t.number),
                score: t.number,
                name: t.string,
            }),
        ),
    ),
    profile: optionalToUndefined(t.string),
    product: optionalToUndefined(t.array(t.string)),
    normalisedJobTitle: optionalToUndefined(t.string),
    level: optionalToUndefined(t.string),
    language: optionalToUndefined(t.array(t.string)),
    jobTitle: optionalToUndefined(t.string),
    industryExperience: optionalToUndefined(t.array(t.string)),
    advertId: optionalToUndefined(t.string),
    education: optionalToUndefined(t.string),
    currentStatus: optionalToUndefined(t.string),
    cleanedExecutiveSummary: optionalToUndefined(t.string),
    advertTitle: optionalToUndefined(t.string),
    accreditations: optionalToUndefined(t.array(t.string)),
});
export type Candidate = t.TypeOf<typeof Candidate>;

export const isCandidate = t.type({
    /* eslint-disable @typescript-eslint/naming-convention */
    hits: t.array(t.type({ _source: Candidate, _index: t.string, _type: t.string, _id: t.string, _score: t.number })),
    total: t.type({ value: t.number, relation: t.string }),
    max_score: t.union([t.number, t.null]),
    /* eslint-enable @typescript-eslint/naming-convention */
});

export const CandidateSearchFacetList = t.array(
    t.type({
        /* eslint-disable @typescript-eslint/naming-convention */
        key: t.string,
        doc_count: t.number,
        /* eslint-enable @typescript-eslint/naming-convention */
    }),
);

export const CandidateSearchFacetNew = t.array(
    t.type({
        /* eslint-disable @typescript-eslint/naming-convention */
        key: t.string,
        doc_count: t.number,
        from: t.number,
        /* eslint-enable @typescript-eslint/naming-convention */
    }),
);

type CandidateSearchFacet = { key: string; docCount: number };
export type GetCandidateSearchFacetsOutput = { skills: CandidateSearchFacet[]; jobTitles: CandidateSearchFacet[]; levels: CandidateSearchFacet[]; newCandidates: NewSearchFacetOutput };
