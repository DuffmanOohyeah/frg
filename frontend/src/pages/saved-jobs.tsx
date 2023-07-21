import React, { useContext } from 'react';
import { NextPage } from 'next';
import UserContext from '../components/utils/WithAuth/UserContext';
import CandidateSavedJobs from '../components/patterns/CandidateArea/SavedJobs';
import AnonSavedJobs from '../components/templates/AnonSavedJobs/AnonSavedJobs';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';

const SavedJobsPage: NextPage = () => {
    const { candidateUserDetails, employerUserDetails } = useContext(UserContext);

    if (candidateUserDetails) {
        return <CandidateSavedJobs />;
    } else if (employerUserDetails) {
        return <RestrictedErrorPage />;
    } else {
        return <AnonSavedJobs />;
    }
};

export default SavedJobsPage;
