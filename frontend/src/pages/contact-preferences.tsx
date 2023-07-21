import React, { useContext } from 'react';
import { NextPage } from 'next';
import UserContext from '../components/utils/WithAuth/UserContext';
import EmployerContactPreferences from '../components/patterns/EmployerArea/EmployerContactPreferences';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';

const ContactPreferences: NextPage = () => {
    const { employerUserDetails } = useContext(UserContext);

    if (!employerUserDetails) {
        return <RestrictedErrorPage />;
    }
    return <EmployerContactPreferences />;
};

export default ContactPreferences;
