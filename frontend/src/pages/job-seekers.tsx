import React, { useContext } from 'react';
import FromWpPage from '../components/pages/FromWpPage/FromWpPage';
import { cond, equals, always, T } from 'ramda';
import JobseekersPageMason from '../components/pages/Mason/job-seekers';
import JobseekersPageJefferson from '../components/pages/Jefferson/job-seekers';
import JobseekersPageNelson from '../components/pages/Nelson/job-seekers';
import JobseekersPageAnderson from '../components/pages/Anderson/job-seekers';
import JobseekersPageNigel from '../components/pages/Nigel/job-seekers';
import JobseekersPageTech from '../components/pages/Tech/job-seekers';
import JobseekersPageWashington from '../components/pages/Washington/job-seekers';
import { BrandContext } from '../components/utils/WithBrand';
import { getConfigServer, Config } from '../client';
import { GetContentPageQueryData } from '../queries';

const JobseekersPageWP = FromWpPage('/job-seekers');

interface RenderPageProps {
    config: Config;
    page: GetContentPageQueryData;
}

const getRenderPage = (brand: string, props: RenderPageProps) =>
    cond<string, React.ReactElement>([
        [equals('Mason'), always(<JobseekersPageMason />)],
        [equals('Jefferson'), always(<JobseekersPageJefferson />)],
        [equals('Nelson'), always(<JobseekersPageNelson />)],
        [equals('Anderson'), always(<JobseekersPageAnderson />)],
        [equals('Nigel'), always(<JobseekersPageNigel />)],
        [equals('FrgTech'), always(<JobseekersPageTech />)],
        [equals('Washington'), always(<JobseekersPageWashington />)],
        [T, always(<JobseekersPageWP {...props} />)],
    ])(brand);

const ComponentToRender = (props: RenderPageProps) => {
    const { brand } = useContext(BrandContext);
    return getRenderPage(brand, props);
};

ComponentToRender.getInitialProps = async ctx => {
    const config = await getConfigServer();
    const { brand } = config;
    return cond<string, Promise<RenderPageProps> | RenderPageProps | undefined | null>([
        [equals('Mason'), always(null)],
        [equals('Jefferson'), always(null)],
        [equals('Nelson'), always(null)],
        [equals('Anderson'), always(null)],
        [equals('Nigel'), always(null)],
        [equals('FrgTech'), always(null)],
        [equals('Washington'), always(null)],
        [T, always(JobseekersPageWP.getInitialProps && JobseekersPageWP.getInitialProps(ctx))],
    ])(brand);
};

export default ComponentToRender;
