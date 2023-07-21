import React, { useContext } from 'react';
import { NextPage } from 'next';

import CandidateAreaPageWrapper from '../components/patterns/CandidateArea/CandidateAreaPageWrapper';
import Dashboard from '../components/patterns/CandidateArea/Dashboard';
import { useTranslation } from 'react-i18next';
import UserContext from '../components/utils/WithAuth/UserContext';
import { getOptionalBoolQueryParam, getOptionalSingleQueryParam } from '../pagesUtil';
import { getJob, GetJobData } from '../queries';
import { getClient, getConfigServer } from '../client';
import { QueryType } from '../queries/util';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';

interface DashboardProps {
    data?: GetJobData;
    registered?: boolean;
}

const DashboardPage: NextPage<DashboardProps> = (props: DashboardProps) => {
    const { t } = useTranslation();
    const { candidateUserDetails, candidateDetailsLoading } = useContext(UserContext);

    if (!candidateUserDetails && !candidateDetailsLoading) {
        return <RestrictedErrorPage />;
    }

    const job = props.data && props.data.getJob;
    return (
        <CandidateAreaPageWrapper header={t('candidate_dashboard_header')}>
            <Dashboard job={job} registered={props.registered} />
        </CandidateAreaPageWrapper>
    );
};

DashboardPage.getInitialProps = async (ctx): Promise<DashboardProps> => {
    const config = await getConfigServer();
    const client = getClient(config);
    const jobRef = decodeURIComponent(getOptionalSingleQueryParam(ctx.query, 'jobRef') || '');
    const registered = getOptionalBoolQueryParam(ctx.query, 'registered');
    if (!jobRef) return { registered };
    return getJob(QueryType.Promise)(client, {
        reference: jobRef,
    }).then(data => ({
        data,
        registered,
    }));
};

export default DashboardPage;
