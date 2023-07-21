import gql from 'graphql-tag';
import { wrapQuery } from './util';

interface ParseCvParams {
    filename: string;
}

interface DaxtraParsePerson {
    /* eslint-disable @typescript-eslint/naming-convention */
    FormattedName?: string;
    FamilyName?: string;
    GivenName?: string;
    sex?: string;
    /* eslint-enable @typescript-eslint/naming-convention */
}

interface DaxtraParseEmploymentHistory {
    /* eslint-disable @typescript-eslint/naming-convention */
    employerOrgType?: string;
    EndDate?: string;
    MonthsOfWork?: number;
    EmployerOrgName?: string;
    Title?: string[];
    OrgName?: string;
    PositionType?: string;
    JobArea?: string;
    JobGrade?: string;
    StartDate?: string;
    Description?: string;
    /* eslint-enable @typescript-eslint/naming-convention */
}

export interface DaxtraParseCompetencyUsed {
    value?: number;
    type?: string;
}

export interface DaxtraParseCompetency {
    skillLevel?: number;
    skillName?: string;
    description?: string;
    auth?: boolean;
    skillUsed?: DaxtraParseCompetencyUsed;
    lastUsed?: string;
    skillProficiency?: string;
    skillAliasArray?: string[];
}

interface DaxtraParseExperienceSummary {
    /* eslint-disable @typescript-eslint/naming-convention */
    TotalYearsOfManagementWorkExperience?: number;
    TotalYearsOfLowLevelManagementWorkExperience?: number;
    TotalMonthsOfWorkExperience?: number;
    ExecutiveBrief?: string;
    TotalMonthsOfLowLevelManagementWorkExperience?: number;
    TotalMonthsOfManagementWorkExperience?: number;
    TotalYearsOfWorkExperience?: number;
    ManagementRecord?: string;
    /* eslint-enable @typescript-eslint/naming-convention */
}

export interface DaxtraExtractedData {
    person?: DaxtraParsePerson;
    employmentHistory?: DaxtraParseEmploymentHistory[];
    skills?: DaxtraParseCompetency[];
    lang?: string;
    experience?: DaxtraParseExperienceSummary;
}

export interface ParseCvData {
    parseCV: DaxtraExtractedData;
}

const ParseCv = gql`
    query parseCV($filename: String!) {
        parseCV(filename: $filename) {
            person {
                FormattedName
                FamilyName
                GivenName
                sex
            }
            employmentHistory {
                employerOrgType
                EndDate
                MonthsOfWork
                EmployerOrgName
                Title
                OrgName
                PositionType
                JobArea
                JobGrade
                StartDate
                Description
            }
            skills {
                skillLevel
                skillName
                description
                auth
                skillUsed {
                    value
                    type
                }
                lastUsed
                skillProficiency
                skillAliasArray
            }
            lang
            experience {
                TotalYearsOfManagementWorkExperience
                TotalYearsOfLowLevelManagementWorkExperience
                TotalMonthsOfWorkExperience
                ExecutiveBrief
                TotalMonthsOfLowLevelManagementWorkExperience
                TotalMonthsOfManagementWorkExperience
                TotalYearsOfWorkExperience
                ManagementRecord
            }
        }
    }
`;
export const parseCV = wrapQuery<ParseCvParams, ParseCvData>(ParseCv);
