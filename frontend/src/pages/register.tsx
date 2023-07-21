import React, { useContext, useEffect } from 'react';
import { NextPage } from 'next';
import Register from '../components/patterns/Register/RegistrationProcess';
import { getConfigServer, Config, isBrowser } from '../client';
import { pick } from 'ramda';
import { SsoAuthTypes } from '../components/patterns/LoginModal/LoginModal';
import { getOptionalBoolQueryParam } from '../pagesUtil';
import UserContext from '../components/utils/WithAuth/UserContext';
import AuthContext from '../components/utils/WithAuth/AuthContext';
import frgI18n from '../i18n/frgI18n';

interface RegisterProps {
    data: Config;
    isJobseeker?: boolean;
}

const RegisterPage: NextPage<RegisterProps> = (props: RegisterProps) => {
    const { user } = useContext(UserContext);
    const { isIncompleteSignup } = useContext(AuthContext);
    const router = frgI18n.useRouter();

    // it alreadly logged in go to the homepage
    // to avoid multipul logins

    useEffect(() => {
        if (user && isBrowser() && !isIncompleteSignup) {
            router.push(
                {
                    pathname: '/',
                },
                '/',
            );
        }
    }, []);

    const ssoAuth: SsoAuthTypes =
        props.data && pick(['googleAuth', 'linkedInAuth', 'githubAuth', 'facebookAuth'], props.data);
    return <Register ssoAuths={ssoAuth} isJobseeker={props.isJobseeker} />;
};

RegisterPage.getInitialProps = async (ctx): Promise<RegisterProps> => {
    const isJobseeker = getOptionalBoolQueryParam(ctx.query, 'isJobseeker');
    return getConfigServer().then(data => ({ data, isJobseeker }));
};

export default RegisterPage;
