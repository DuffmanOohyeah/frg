import gql from 'graphql-tag';
import { wrapQuery } from './util';
import { Job } from './getJob';

export type IndeedSitemapJob = Pick<
    Job,
    'title' | 'lastModified' | 'reference' | 'location' | 'description' | 'salary' | 'type'
>;

type LastSearchJob = Pick<Job, 'lastModified' | 'reference'>;

export interface GetAllJobsForIndeedSitemapParams {
    lastSearchJob?: LastSearchJob;
}

export interface GetAllJobsForIndeedSitemapData {
    getAllJobsForIndeedSitemap: IndeedSitemapJob[];
}

const GetAllJobsForIndeedSitemap = gql`
    query getAllJobsForIndeedSitemap($lastSearchJob: IndeedSitemapJobInput) {
        getAllJobsForIndeedSitemap(lastSearchJob: $lastSearchJob) {
            title
            lastModified
            reference
            location {
                description
                country
                region
            }
            description
            salary {
                from
                to
                currency
                description
            }
            type
        }
    }
`;

export const getAllJobsForIndeedSitemap = wrapQuery<GetAllJobsForIndeedSitemapParams, GetAllJobsForIndeedSitemapData>(
    GetAllJobsForIndeedSitemap,
);
