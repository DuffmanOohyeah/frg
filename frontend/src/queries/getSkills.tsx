import gql from 'graphql-tag';
import { wrapQuery } from './util';

type GetSkillsParams = Record<string, never>;

interface GetSkillsData {
    getSkills: string[];
}

export const GetSkills = gql`
    query getSkills {
        getSkills
    }
`;
export const getSkills = wrapQuery<GetSkillsParams, GetSkillsData>(GetSkills);
