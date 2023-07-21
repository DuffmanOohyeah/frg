import gql from 'graphql-tag';
import { wrapQuery } from './util';
import { SearchFormQuery } from '../components/patterns/SearchForm/SearchForm';

export interface SaveJobSearchData {
    confirm: string;
}

export interface SaveJobSearchParams extends SearchFormQuery {
    searchName: string;
    emailAlert: boolean;
}

export const SaveJobSearch = gql`
    query saveJobSearch(
        $searchName: String!
        $keyword: String
        $location: String
        $role: [String!]
        $level: [String!]
        $jobType: String
        $remote: Boolean
        $security: Boolean
        $newJobs: Boolean
        $salaryFrom: String
        $salaryTo: String
        $salaryCurrency: String
        $emailAlert: Boolean
        $product: String
        $segment: String
    ) {
        saveJobSearch(
            searchName: $searchName
            keyword: $keyword
            location: $location
            role: $role
            level: $level
            jobType: $jobType
            remote: $remote
            security: $security
            newJobs: $newJobs
            salaryFrom: $salaryFrom
            salaryTo: $salaryTo
            salaryCurrency: $salaryCurrency
            emailAlert: $emailAlert
            segment: $segment
            product: $product
        ) {
            searchName
            keyword
            location
            role
            level
            jobType
            page
            remote
            security
            newJobs
            salaryFrom
            salaryTo
            salaryCurrency
            segment
            product
        }
    }
`;

export const saveJobSearch = wrapQuery<SaveJobSearchParams, SaveJobSearchData>(SaveJobSearch);
