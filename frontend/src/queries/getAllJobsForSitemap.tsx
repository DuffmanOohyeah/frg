import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface JobsForSitemap {
    lastModified: string;
    reference: string;
    title: string;
}

type GetAllJobsForSitemapParams = Record<string, never>;

interface GetAllJobsForSitemapData {
    getAllJobsForSitemap: JobsForSitemap[];
}

const GetAllJobsForSitemap = gql`
    query getAllJobsForSitemap {
        getAllJobsForSitemap {
            lastModified
            reference
            title
        }
    }
`;

export const getAllJobsForSitemap = wrapQuery<GetAllJobsForSitemapParams, GetAllJobsForSitemapData>(
    GetAllJobsForSitemap,
);
