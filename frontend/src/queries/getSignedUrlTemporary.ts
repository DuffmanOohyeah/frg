import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface GetSignedUrlTemporaryData {
    getSignedUrlTemporary: {
        put: string;
        get: string;
    };
}

export interface GetSignedUrlTemporaryParams {
    filename: string;
    filetype: string;
}

export const GetSignedUrlTemporary = gql`
    query getSignedUrlTemporary($filename: String!, $filetype: String!) {
        getSignedUrlTemporary(filename: $filename, filetype: $filetype) {
            put
            get
        }
    }
`;

export const getSignedUrlTemporary = wrapQuery<GetSignedUrlTemporaryParams, GetSignedUrlTemporaryData>(
    GetSignedUrlTemporary,
);
