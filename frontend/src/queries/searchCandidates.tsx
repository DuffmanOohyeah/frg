import gql from 'graphql-tag';
import { wrapQuery } from './util';
import { Candidate } from './getCandidate';
import { JobType } from '../types';

export interface SearchCandidatesQueryFrontend {
    keyword: string;
    location: string;
    jobType: JobType;
    skills?: string[];
    jobTitles?: string[];
    levels?: string[];
    newCandidates?: boolean;
    page?: number;
}

export interface SearchCandidatesQuery {
    keyword: string;
    location: string;
    jobType: JobType;
    skills?: string[];
    jobTitles?: string[];
    levels?: string[];
    addedSince?: Date;
    page?: number;
}

export const defaultSearchCandidatesQuery: SearchCandidatesQueryFrontend = {
    keyword: '',
    location: '',
    jobType: JobType.Both,
    skills: [],
    jobTitles: [],
    levels: [],
    newCandidates: undefined,
    page: 1,
};

export interface SearchCandidatesData {
    searchCandidates: {
        items: Array<Candidate>;
        pagination: {
            value: number;
            relation: string;
        };
    };
    getCandidateSearchFacets: {
        skills: { key: string; docCount: number }[];
        jobTitles: { key: string; docCount: number }[];
        levels: { key: string; docCount: number }[];
        newCandidates: { key: string; docCount: number; value: string }[];
    };
}

export const SearchCandidates = gql`
    query searchCandidates(
        $keyword: String
        $location: String
        $jobType: String
        $skills: [String!]
        $jobTitles: [String!]
        $levels: [String!]
        $addedSince: String
        $page: Int
    ) {
        searchCandidates(
            keyword: $keyword
            location: $location
            jobType: $jobType
            skills: $skills
            jobTitles: $jobTitles
            levels: $levels
            addedSince: $addedSince
            page: $page
        ) {
            items {
                id
                indexedAt
                lastModified
                salary {
                    currency
                    normalised
                    amount
                    description
                }
                recruiter {
                    phone
                    name
                    email
                }
                location {
                    description
                }
                willingToWorkRemotely
                willingToRelocate
                type
                skills {
                    yearsExperience
                    score
                    name
                }
                profile
                product
                normalisedJobTitle
                level
                language
                jobTitle
                industryExperience
                advertId
                education
                currentStatus
                advertTitle
                accreditations
            }
            pagination {
                value
                relation
            }
        }
        getCandidateSearchFacets(keyword: $keyword, location: $location, jobType: $jobType) {
            skills {
                key
                docCount
            }
            jobTitles {
                key
                docCount
            }
            levels {
                key
                docCount
            }
            newCandidates {
                key
                docCount
                value
            }
        }
    }
`;

export const searchCandidates = wrapQuery<Partial<SearchCandidatesQuery>, SearchCandidatesData>(SearchCandidates);
