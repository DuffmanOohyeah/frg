import gql from 'graphql-tag';
import { wrapQuery } from './util';
import { SearchFormQuery } from '../components/patterns/SearchForm/SearchForm';

export interface SavedJobSearch {
    searchName: string;
    id: string;
    params: SearchFormQuery;
    emailAlert?: boolean;
}

type GetSavedJobSearchesParams = Record<string, never>;

interface GetSavedJobSearchesData {
    getSavedJobSearches: SavedJobSearch[];
}

export const GetSavedJobSearches = gql`
    query getSavedJobSearches {
        getSavedJobSearches {
            searchName
            id
            params {
                keyword
                location
                role
                level
                jobType
                remote
                security
                newJobs
                salaryFrom
                salaryTo
                salaryCurrency
                segment
                product
            }
            emailAlert
        }
    }
`;

export const getSavedJobSearches = wrapQuery<GetSavedJobSearchesParams, GetSavedJobSearchesData>(GetSavedJobSearches);
