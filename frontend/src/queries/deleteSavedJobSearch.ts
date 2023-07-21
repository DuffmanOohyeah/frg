import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface DeleteSavedJobSearchData {
    deleteSavedJobSearch: {
        id: string;
    };
}

export interface DeleteSavedJobSearchParams {
    id: string;
}

export const DeleteSavedJobSearch = gql`
    query deleteSavedJobSearch($id: String!) {
        deleteSavedJobSearch(id: $id) {
            id
        }
    }
`;

export const deleteSavedJobSearch = wrapQuery<DeleteSavedJobSearchParams, DeleteSavedJobSearchData>(
    DeleteSavedJobSearch,
);
