import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface Candidate {
    id: string;
    indexedAt: string;
    lastModified: string;
    salary: {
        currency?: string;
        normalised?: number;
        amount?: number;
        description?: string;
    };
    recruiter: {
        phone?: string;
        name: string;
        email: string;
    };
    location: { description: string };
    willingToWorkRemotely?: boolean;
    willingToRelocate?: boolean;
    type?: string;
    skills: {
        yearsExperience?: number;
        score: number;
        name: string;
    }[];
    profile: string;
    product: string[];
    normalisedJobTitle?: string;
    level?: string;
    language?: string[];
    jobTitle?: string;
    industryExperience?: string[];
    advertId?: string;
    education?: string;
    currentStatus?: string;
    advertTitle?: string;
    accreditations?: string[];
}

export interface GetCandidateData {
    getCandidate: Candidate;
}

export interface GetCandidateParams {
    id: string;
}

export const GetCandidate = gql`
    query getCandidate($id: String!) {
        getCandidate(id: $id) {
            id
            indexedAt
            lastModified
            salary {
                currency
                normalised
                amount
                description
            }
            recruiter {
                phone
                name
                email
            }
            location {
                description
            }
            willingToWorkRemotely
            willingToRelocate
            type
            skills {
                yearsExperience
                score
                name
            }
            profile
            product
            normalisedJobTitle
            level
            language
            jobTitle
            industryExperience
            advertId
            education
            currentStatus
            advertTitle
            accreditations
        }
    }
`;

export const getCandidate = wrapQuery<GetCandidateParams, GetCandidateData>(GetCandidate);
