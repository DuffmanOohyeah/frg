import { SearchFormQuery } from '../components/patterns/SearchForm/SearchForm';
import { CandidateUserDetails } from '../components/utils/WithAuth/CandidateDetails';
import { JobType } from '../types';
import valueToEnum from './valueToEnum';

export const makeSearchFromCandidateProfile = (candidateProfile?: CandidateUserDetails): Partial<SearchFormQuery> => {
    if (candidateProfile) {
        return {
            keyword: candidateProfile.jobTitle,
            jobType: valueToEnum<typeof JobType>(JobType, candidateProfile.jobType) || JobType.Both,
            location: candidateProfile.willingToRelocate ? undefined : candidateProfile.currentLocation,
        };
    }
    return {};
};
