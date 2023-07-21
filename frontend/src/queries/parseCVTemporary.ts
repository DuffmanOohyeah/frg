import gql from 'graphql-tag';
import { DaxtraExtractedData } from './parseCV';
import { wrapQuery } from './util';

interface ParseCVTemporaryParams {
    filetype: string;
    signedGetUrl: string;
}

export interface ParseCVTemporaryData {
    parseCVTemporary: DaxtraExtractedData;
}

const ParseCVTemporary = gql`
    query parseCVTemporary($filetype: String!, $signedGetUrl: String!) {
        parseCVTemporary(filetype: $filetype, signedGetUrl: $signedGetUrl) {
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
export const parseCVTemporary = wrapQuery<ParseCVTemporaryParams, ParseCVTemporaryData>(ParseCVTemporary);
