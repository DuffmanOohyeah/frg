import * as t from 'io-ts';
import { SaveJobSearchParameters } from './inputTypes';

export const GetSavedJobSearchesDBQuery = t.type({
    /* eslint-disable @typescript-eslint/naming-convention */
    sk: t.string,
    search_name: t.string,
    pk: t.string,
    search_params: t.type({ ...SaveJobSearchParameters }),
    email_alert: t.boolean,
    /* eslint-enable @typescript-eslint/naming-convention */
});

const SavedJobSearch = t.type({
    searchName: t.string,
    id: t.string,
    params: t.type(SaveJobSearchParameters),
});

export const GetSavedJobSearchesData = t.array(SavedJobSearch);

export type GetSavedJobSearchesData = t.TypeOf<typeof GetSavedJobSearchesData>;

export interface DeleteSavedJobSearch {
    id: string;
}

export interface UpdateSavedJobSearchOutput {
    enable: boolean;
}
