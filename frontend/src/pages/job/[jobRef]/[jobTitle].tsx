import { NextPage } from 'next';
import React, { ReactElement } from 'react';
import { getClient, getConfigServer } from '../../../client';
import ViewJob from '../../../components/patterns/ViewJob/ViewJob';
import JobErrorPage from '../../../components/templates/Errors/JobError';
import StyledContainer from '../../../components/utils/Container/Container';
import { getSingleQueryParam } from '../../../pagesUtil';
import { getJob, GetJobData } from '../../../queries';
import { QueryType } from '../../../queries/util';
import formatJobTitleForUrl from '../../../utils/formatJobTitleForUrl';

interface ViewJobProps {
    data?: GetJobData;
    is404?: boolean;
}

const ViewJobPage: NextPage<ViewJobProps> = (props: ViewJobProps): ReactElement => {
    const job = props.data?.getJob;

    if (!job) {
        return <JobErrorPage />;
    }

    return (
        <StyledContainer size="medium" marginTop={true}>
            <ViewJob key={job.reference} job={job} />
        </StyledContainer>
    );
};

ViewJobPage.getInitialProps = async (ctx): Promise<ViewJobProps> => {
    const config = await getConfigServer();
    const client = getClient(config);
    const jobRef = getSingleQueryParam(ctx.query, 'jobRef');
    const jobTitle = getSingleQueryParam(ctx.query, 'jobTitle');

    const data = await getJob(QueryType.Promise)(client, {
        reference: jobRef,
    });

    const job = data.getJob;

    if (job && formatJobTitleForUrl(job.title) === jobTitle) {
        return { data };
    }
    // set the status code for the error page
    // that is displayed if there is no job
    if (!data?.getJob && ctx.res) {
        ctx.res.statusCode = 404;
    }
    return {};
};

export default ViewJobPage;
