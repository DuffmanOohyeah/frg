import { NextPage } from 'next';
import React, { useContext } from 'react';
import CandidateProfile from '../components/patterns/CandidateArea/CandidateProfile';
import EmployerProfile from '../components/patterns/EmployerArea/EmployerProfile';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';
import UserContext from '../components/utils/WithAuth/UserContext';

const ProfilePage: NextPage = () => {
    const { employerUserDetails, candidateUserDetails, employerDetailsLoading, candidateDetailsLoading } = useContext(
        UserContext,
    );

    if (employerUserDetails || employerDetailsLoading) {
        return <EmployerProfile />;
    } else if (candidateUserDetails || candidateDetailsLoading) {
        return <CandidateProfile />;
    } else {
        return <RestrictedErrorPage />;
    }
};

export default ProfilePage;
