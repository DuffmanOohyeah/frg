import gql from 'graphql-tag';
import { wrapQuery } from './util';

type GetEmploymentPreferencesParams = Record<string, never>;

interface GetEmploymentPreferencesData {
    getEmploymentPreferences: string[];
}

export const GetEmploymentPreferences = gql`
    query getEmploymentPreferences {
        getEmploymentPreferences
    }
`;
export const getEmploymentPreferences = wrapQuery<GetEmploymentPreferencesParams, GetEmploymentPreferencesData>(
    GetEmploymentPreferences,
);
