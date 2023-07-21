import React, { useContext } from 'react';
import { NextPage } from 'next';
import UserContext from '../components/utils/WithAuth/UserContext';
import CandidateSavedSearches from '../components/patterns/CandidateArea/CandidateSavedSearches';
import EmployerSavedSearches from '../components/patterns/EmployerArea/EmployerSavedSearches';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';

const SearchAndAlertsPage: NextPage = () => {
    const { employerUserDetails, candidateUserDetails } = useContext(UserContext);

    if (employerUserDetails) {
        return <EmployerSavedSearches />;
    } else if (candidateUserDetails) {
        return <CandidateSavedSearches />;
    } else {
        return <RestrictedErrorPage />;
    }
};

export default SearchAndAlertsPage;
