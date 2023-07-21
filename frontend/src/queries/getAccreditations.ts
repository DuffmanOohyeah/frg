import gql from 'graphql-tag';
import { wrapQuery } from './util';

type GetAccreditationsParams = Record<string, never>;

interface GetAccreditationsData {
    getAccreditations: string[];
}

export const GetAccreditations = gql`
    query getAccreditations {
        getAccreditations
    }
`;
export const getAccreditations = wrapQuery<GetAccreditationsParams, GetAccreditationsData>(GetAccreditations);
