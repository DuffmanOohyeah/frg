import { NextPage } from 'next';
import { pick } from 'ramda';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Config, getClient, getConfigServer } from '../../client';
import { Card, CardBody } from '../../components/bits/Card/Card';
import { SsoAuthTypes } from '../../components/patterns/LoginModal/LoginModal';
import ConfirmCvContainer from '../../components/patterns/Register/ConfirmCv/ConfirmCvContainer';
import Register from '../../components/patterns/Register/RegistrationProcess';
import JobErrorPage from '../../components/templates/Errors/JobError';
import AuthContext from '../../components/utils/WithAuth/AuthContext';
import UserContext from '../../components/utils/WithAuth/UserContext';
import { getOptionalBoolQueryParam, getOptionalSingleQueryParam } from '../../pagesUtil';
import { getJob, GetJobData } from '../../queries';
import { QueryType } from '../../queries/util';
import Container from '../../components/utils/Container/Container';
import useI18nRouter from '../../i18n/useI18nRouter';

interface ApplyProps {
    data: GetJobData;
    config: Config;
    navToLogin?: boolean;
}

const ApplyPage: NextPage<ApplyProps> = (props: ApplyProps): ReactElement => {
    const { t } = useTranslation();

    const job = props.data?.getJob;
    const { user, employerUserDetails } = useContext(UserContext);
    const { isIncompleteSignup } = useContext(AuthContext);
    const ssoAuths: SsoAuthTypes = pick(['googleAuth', 'linkedInAuth', 'githubAuth', 'facebookAuth'], props.config);
    const [creatingAccount, setCreatingAccount] = useState(false);
    const router = useI18nRouter();

    // this removes navToLogin after its been
    // used so it doesnt get used again
    useEffect(() => {
        if (props.navToLogin) {
            router.replace(
                {
                    pathname: router.pathname,
                    query: { ...router.query, navToLogin: undefined },
                },
                undefined,
                {
                    shallow: true,
                },
            );
        }
    }, []);

    if (!job) {
        return <JobErrorPage />;
    }

    if (user && employerUserDetails) {
        return (
            <Container size="medium" marginTop>
                <Card>
                    <CardBody>{t('registerProcess_candidate_isEmployeeeError')}</CardBody>
                </Card>
            </Container>
        );
    }

    // if we login with the loggin modal then we want to swap to the confirm cv container
    // if we login via the registration then we dont want to swap
    if (user && !isIncompleteSignup && !creatingAccount) return <ConfirmCvContainer job={job} />;

    return (
        <Register job={job} ssoAuths={ssoAuths} setCreatingAccount={setCreatingAccount} navToLogin={props.navToLogin} />
    );
};

ApplyPage.getInitialProps = async (ctx): Promise<ApplyProps> => {
    const config = await getConfigServer();
    const client = getClient(config);
    const jobRef = decodeURIComponent(getOptionalSingleQueryParam(ctx.query, 'jobRef') || '');
    const navToLogin = getOptionalBoolQueryParam(ctx.query, 'navToLogin');

    const data = await getJob(QueryType.Promise)(client, {
        reference: jobRef,
    });
    // set the status code for the error page
    // that is displayed if there is no job
    if (!data?.getJob && ctx.res) {
        ctx.res.statusCode = 404;
    }
    return {
        data,
        config,
        navToLogin,
    };
};

export default ApplyPage;
