import gql from 'graphql-tag';
import { wrapQuery } from './util';
import { Job } from './getJob';
import { JobType, SearchFilterNameAndCount } from '../types';

export interface SearchJobsData {
    searchJobs: {
        items: Array<Job>;
        pagination: {
            value: number;
            relation: string;
        };
    };
    getJobSearchFacetCounts: {
        roles: SearchFilterNameAndCount[];
        levels: SearchFilterNameAndCount[];
        security: SearchFilterNameAndCount[];
        remote: SearchFilterNameAndCount[];
        newJobs: SearchFilterNameAndCount[];
        currencies: SearchFilterNameAndCount[];
    };
}

export const SearchJobs = gql`
    query searchJobs(
        $keyword: String
        $location: String
        $role: [String!]
        $level: [String!]
        $jobType: String
        $page: Int
        $remote: Boolean
        $security: Boolean
        $addedSince: String
        $salaryFrom: String
        $salaryTo: String
        $salaryCurrency: String
        $product: String
        $segment: String
    ) {
        searchJobs(
            keyword: $keyword
            location: $location
            role: $role
            level: $level
            jobType: $jobType
            page: $page
            remote: $remote
            security: $security
            addedSince: $addedSince
            salaryFrom: $salaryFrom
            salaryTo: $salaryTo
            salaryCurrency: $salaryCurrency
            product: $product
            segment: $segment
        ) {
            pagination {
                value
                relation
            }
            items {
                indexedAt
                lastModified
                contactName
                contactEmail
                applicationEmail
                reference
                title
                type
                skills
                description
                product
                segment
                role
                remote
                needsSecurityClearance
                seniority
                location {
                    description
                    country
                    region
                }
                salary {
                    from
                    to
                    currency
                    description
                }
            }
        }
        getJobSearchFacetCounts(keyword: $keyword, location: $location, jobType: $jobType) {
            roles {
                key
                docCount
            }
            levels {
                key
                docCount
            }
            security {
                key
                docCount
                value
            }
            remote {
                key
                docCount
                value
            }
            newJobs {
                key
                docCount
                value
            }
            currencies {
                key
                docCount
            }
        }
    }
`;

// this type conflicts with SearchFormQuery due to the newJobs field
//  dates cannot be put into a url query so intead we put in a boolean
//  and change it after to a date
interface SearchJobsQuery {
    keyword: string;
    location: string;
    jobType: JobType;
    role: string[];
    level: string[];
    page?: number;
    remote?: boolean;
    security?: boolean;
    addedSince?: Date;
    salaryFrom?: string;
    salaryTo?: string;
    salaryCurrency?: string;
    product?: string;
    segment?: string;
}

export const defaultSearchJobsQuery: SearchJobsQuery = {
    keyword: '',
    location: '',
    jobType: JobType.Both,
    role: [],
    level: [],
    page: 1,
};

export const searchJobs = wrapQuery<Partial<SearchJobsQuery>, SearchJobsData>(SearchJobs);
