import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface UpdateSavedJobSearchData {
    updateSavedJobSearch: {
        enable: string;
    };
}

export interface UpdateSavedJobSearchParams {
    id: string;
    enable: boolean;
}

export const UpdateSavedJobSearch = gql`
    query updateSavedJobSearch($id: String!, $enable: Boolean!) {
        updateSavedJobSearch(id: $id, enable: $enable) {
            enable
        }
    }
`;

export const updateSavedJobSearch = wrapQuery<UpdateSavedJobSearchParams, UpdateSavedJobSearchData>(
    UpdateSavedJobSearch,
);
