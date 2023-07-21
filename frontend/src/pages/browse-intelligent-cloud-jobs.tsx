import React, { useContext } from 'react';
import CatchAllErrorPage from '../components/templates/Errors/CatchAllError';
import { cond, equals, always, T } from 'ramda';
import { BrandContext, BrowseJobsPageVariants } from '../components/utils/WithBrand';
import BrowseJobsPage from './browse-jobs';
import { NextPage } from 'next';
import { getConfigServer } from '../client';

const BrowseIntelligentCloudJobsPage: NextPage = (): JSX.Element => {
    const { brand } = useContext(BrandContext);
    return cond<string, JSX.Element>([
        [equals('Anderson'), always(<CatchAllErrorPage />)],
        [equals('Mason'), always(<CatchAllErrorPage />)],
        [equals('Nelson'), always(<CatchAllErrorPage />)],
        [equals('Nigel'), always(<BrowseJobsPage variant={BrowseJobsPageVariants.INTELLIGENT_CLOUD} />)],
        [equals('Jefferson'), always(<CatchAllErrorPage />)],
        [equals('Washington'), always(<CatchAllErrorPage />)],
        [equals('FrgTech'), always(<CatchAllErrorPage />)],
    ])(brand);
};

BrowseIntelligentCloudJobsPage.getInitialProps = async ctx => {
    const config = await getConfigServer();
    const { brand } = config;

    cond<string, null | void>([
        [equals('Nigel'), always(null)],
        [
            T,
            () => {
                if (ctx.res) {
                    ctx.res.statusCode = 404;
                }
            },
        ],
    ])(brand);
};

export default BrowseIntelligentCloudJobsPage;
