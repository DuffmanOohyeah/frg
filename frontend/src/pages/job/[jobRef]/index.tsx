import { getClient, getConfigServer } from '../../../client';
import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import { getJob } from '../../../queries';
import { getSingleQueryParam } from '../../../pagesUtil';
import { QueryType } from '../../../queries/util';
import JobErrorPage from '../../../components/templates/Errors/JobError';
import formatJobTitleForUrl from '../../../utils/formatJobTitleForUrl';

const ViewJobPage: NextPage = (): ReactElement => {
    return <JobErrorPage />;
};

ViewJobPage.getInitialProps = async (ctx): Promise<null> => {
    const config = await getConfigServer();
    const client = getClient(config);
    const jobRef = getSingleQueryParam(ctx.query, 'jobRef');

    const data = await getJob(QueryType.Promise)(client, {
        reference: decodeURIComponent(jobRef),
    });

    if (data?.getJob && ctx.res) {
        const jobTitle = formatJobTitleForUrl(data.getJob.title);
        ctx.res.writeHead(301, {
            location: `/job/${encodeURIComponent(jobRef)}/${jobTitle}`,
        });
        ctx.res.end();
    }
    // set the status code for the error page
    // that is displayed if there is no job
    if (!data?.getJob && ctx.res) {
        ctx.res.statusCode = 404;
    }
    return null;
};

export default ViewJobPage;
