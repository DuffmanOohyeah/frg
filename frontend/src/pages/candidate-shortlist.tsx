import React, { useContext } from 'react';
import { NextPage } from 'next';
import UserContext from '../components/utils/WithAuth/UserContext';
import CandidateShortlist from '../components/patterns/EmployerArea/CandidateShortlist';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';

const CandidateShortlistPage: NextPage = () => {
    const { employerUserDetails } = useContext(UserContext);

    if (!employerUserDetails) {
        return <RestrictedErrorPage />;
    }
    return <CandidateShortlist />;
};

export default CandidateShortlistPage;
