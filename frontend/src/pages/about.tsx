import FromWpPage from '../components/pages/FromWpPage/FromWpPage';
import React, { useContext } from 'react';
import { BrandContext } from '../components/utils/WithBrand';
import { GetContentPageQueryData } from '../queries';
import { cond, always, T, equals } from 'ramda';
import { Config, getConfigServer } from '../client';
import AboutPageMason from '../components/pages/Mason/about';
import AboutPageJefferson from '../components/pages/Jefferson/about';
import AboutPageAnderson from '../components/pages/Anderson/about';
import AboutPageNelson from '../components/pages/Nelson/about';
import AboutPageNigel from '../components/pages/Nigel/about';
import AboutPageTech from '../components/pages/Tech/about';
import AboutPageWashington from '../components/pages/Washington/about';

const AboutPageWP = FromWpPage('/about');

interface AboutPageProps {
    config: Config;
    page: GetContentPageQueryData;
}

const getRenderPage = (brand: string, props: AboutPageProps) =>
    cond<string, JSX.Element>([
        [equals('Mason'), always(<AboutPageMason />)],
        [equals('Jefferson'), always(<AboutPageJefferson />)],
        [equals('Anderson'), always(<AboutPageAnderson />)],
        [equals('Nelson'), always(<AboutPageNelson />)],
        [equals('Nigel'), always(<AboutPageNigel />)],
        [equals('FrgTech'), always(<AboutPageTech />)],
        [equals('Washington'), always(<AboutPageWashington />)],
        [T, always(<AboutPageWP {...props} />)],
    ])(brand);

const ComponentToRender = (props: AboutPageProps) => {
    const { brand } = useContext(BrandContext);
    return getRenderPage(brand, props);
};

ComponentToRender.getInitialProps = async ctx => {
    const config = await getConfigServer();
    const { brand } = config;
    return cond<string, Promise<AboutPageProps> | AboutPageProps | undefined | null>([
        [equals('Mason'), always(null)],
        [equals('Jefferson'), always(null)],
        [equals('Anderson'), always(null)],
        [equals('Nelson'), always(null)],
        [equals('Nigel'), always(null)],
        [equals('FrgTech'), always(null)],
        [equals('Washington'), always(null)],
        [T, always(AboutPageWP.getInitialProps && AboutPageWP.getInitialProps(ctx))],
    ])(brand);
};

export default ComponentToRender;
