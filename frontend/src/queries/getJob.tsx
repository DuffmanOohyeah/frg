import gql from 'graphql-tag';
import { wrapQuery } from './util';

interface SearchLocation {
    description: string;
    country: string;
    region: string;
}

export interface SearchJobSalary {
    from?: number;
    to?: number;
    currency: string;
    description: string;
}

export interface Job {
    indexedAt: string;
    lastModified: string;
    contactName: string;
    contactEmail: string;
    applicationEmail: string;
    reference: string;
    title: string;
    type: string;
    skills: string[];
    description: string;
    product?: string;
    segment?: string;
    role: string;
    remote: boolean;
    needsSecurityClearance: boolean;
    seniority: string;
    location: SearchLocation;
    salary: SearchJobSalary;
}

export interface GetJobData {
    getJob: Job;
}

export interface GetJobParams {
    reference: string;
}

export const GetJob = gql`
    query getJob($reference: String!) {
        getJob(reference: $reference) {
            indexedAt
            lastModified
            contactName
            contactEmail
            applicationEmail
            reference
            title
            type
            skills
            description
            product
            role
            remote
            needsSecurityClearance
            seniority
            location {
                description
                country
                region
            }
            salary {
                from
                to
                currency
                description
            }
        }
    }
`;
export const getJob = wrapQuery<GetJobParams, GetJobData>(GetJob);
