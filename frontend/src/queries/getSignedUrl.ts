import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface GetSignedUrlData {
    getSignedUrl: {
        put: string;
        get: string;
    };
}

export interface GetSignedUrlParams {
    filename: string;
    filetype: string;
}

export const GetSignedUrl = gql`
    query getSignedUrl($filename: String!, $filetype: String!) {
        getSignedUrl(filename: $filename, filetype: $filetype) {
            put
            get
        }
    }
`;

export const getSignedUrl = wrapQuery<GetSignedUrlParams, GetSignedUrlData>(GetSignedUrl);
