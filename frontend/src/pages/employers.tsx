import React, { useContext } from 'react';
import FromWpPage from '../components/pages/FromWpPage/FromWpPage';
import { cond, equals, always, T } from 'ramda';
import EmployersPageMason from '../components/pages/Mason/employers';
import EmployersPageAnderson from '../components/pages/Anderson/employers';
import EmployersPageJefferson from '../components/pages/Jefferson/employers';
import EmployersPageNelson from '../components/pages/Nelson/employers';
import EmployersPageNigel from '../components/pages/Nigel/employers';
import EmployersPageWashington from '../components/pages/Washington/employers';
import EmployersPageTech from '../components/pages/Tech/employers';
import { BrandContext } from '../components/utils/WithBrand';
import { getConfigServer, Config } from '../client';
import { GetContentPageQueryData } from '../queries';

const EmployersPageWP = FromWpPage('/employers');

interface EmployersPageProps {
    config: Config;
    page: GetContentPageQueryData;
}

const getRenderPage = (brand: string, props: EmployersPageProps) =>
    cond<string, JSX.Element>([
        [equals('Jefferson'), always(<EmployersPageJefferson />)],
        [equals('Mason'), always(<EmployersPageMason />)],
        [equals('Anderson'), always(<EmployersPageAnderson {...props} />)],
        [equals('Nelson'), always(<EmployersPageNelson {...props} />)],
        [equals('Nigel'), always(<EmployersPageNigel />)],
        [equals('FrgTech'), always(<EmployersPageTech {...props} />)],
        [equals('Washington'), always(<EmployersPageWashington {...props} />)],
        [T, always(<EmployersPageWP {...props} />)],
    ])(brand);

const ComponentToRender = (props: EmployersPageProps) => {
    const { brand } = useContext(BrandContext);
    return getRenderPage(brand, props);
};

interface ConfigProps {
    config: Config;
}

ComponentToRender.getInitialProps = async ctx => {
    const config = await getConfigServer();
    const { brand } = config;
    return cond<string, Promise<EmployersPageProps> | EmployersPageProps | ConfigProps | undefined | null>([
        [equals('Jefferson'), always(null)],
        [equals('Mason'), always(null)],
        [equals('Anderson'), always({ config: config })],
        [equals('Nelson'), always({ config: config })],
        [equals('Nigel'), always(null)],
        [equals('FrgTech'), always({ config: config })],
        [equals('Washington'), always({ config: config })],
        [T, always(EmployersPageWP.getInitialProps && EmployersPageWP.getInitialProps(ctx))],
    ])(brand);
};

export default ComponentToRender;
