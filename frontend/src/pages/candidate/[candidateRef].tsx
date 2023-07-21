import StyledContainer from '../../components/utils/Container/Container';
import { getClient, getConfigServer } from '../../client';
import React, { ReactElement, useContext } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import { getCandidate, GetCandidateData } from '../../queries';
import ViewCandidate from '../../components/patterns/ViewCandidate/ViewCandidate';
import { getSingleQueryParam } from '../../pagesUtil';
import { QueryType } from '../../queries/util';
import UserContext from '../../components/utils/WithAuth/UserContext';
import { Card, CardBody } from '../../components/bits/Card/Card';
import CandidateErrorPage from '../../components/templates/Errors/CandidateError';
import CandidateProfilePaywall from '../../components/templates/CandidateProfilePaywall/CandidateProfilePaywall';

const LoginAsEmployerToAccessCandidate = (): React.ReactElement => {
    const { t } = useTranslation();
    return (
        <StyledContainer>
            <Card>
                <CardBody>{t('candidate_profile_notLoggedInAsEmployer')}</CardBody>
            </Card>
        </StyledContainer>
    );
};

const VerifyEmailToAccess = (): React.ReactElement => {
    const { t } = useTranslation();
    return (
        <StyledContainer>
            <Card>
                <CardBody>{t('candidate_profile_verifyEmailAddress')}</CardBody>
            </Card>
        </StyledContainer>
    );
};

interface ViewCandidateProps {
    data: GetCandidateData;
}

const ViewCandidatePage: NextPage<ViewCandidateProps> = (props: ViewCandidateProps): ReactElement => {
    const { emailVerified, employerUserDetails, candidateUserDetails } = useContext(UserContext);
    const data = props.data.getCandidate;

    if (!data) {
        return <CandidateErrorPage />;
    }

    if (candidateUserDetails) {
        return <LoginAsEmployerToAccessCandidate />;
    }

    if (!employerUserDetails) {
        return <CandidateProfilePaywall />;
    }

    if (!emailVerified) {
        return <VerifyEmailToAccess />;
    }

    return (
        <StyledContainer size="medium" marginTop={true}>
            <ViewCandidate key={data.id} candidate={data} />
        </StyledContainer>
    );
};

ViewCandidatePage.getInitialProps = async (ctx): Promise<ViewCandidateProps> => {
    const config = await getConfigServer();
    const client = getClient(config);
    const candidateRef = getSingleQueryParam(ctx.query, 'candidateRef');
    const data = await getCandidate(QueryType.Promise)(client, {
        id: candidateRef,
    });
    // set the status code for the error page
    // that is displayed if there is no candidate
    if (!data?.getCandidate && ctx.res) {
        ctx.res.statusCode = 404;
    }
    return { data };
};

export default ViewCandidatePage;
