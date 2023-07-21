import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { Config } from '../client';
import FromWpPage from '../components/pages/FromWpPage/FromWpPage';
import Container from '../components/utils/Container/Container';
import { GetContentPageQueryData } from '../queries';
import { BrandContext } from '../components/utils/WithBrand';

const TAndCPage = FromWpPage('/tandc');

interface TAndCPageProps {
    config: Config;
    page: GetContentPageQueryData;
}

const getRenderPage = (brand: string, props: TAndCPageProps) =>
    cond<string, JSX.Element>([
        [
            equals('Washington'),
            always(
                <Container>
                    <TAndCPage {...props} />
                </Container>,
            ),
        ],
        [
            equals('FrgTech'),
            always(
                <Container>
                    <TAndCPage {...props} />
                </Container>,
            ),
        ],
        [T, always(<TAndCPage {...props} />)],
    ])(brand);

const ComponentToRender = (props: TAndCPageProps) => {
    const { brand } = useContext(BrandContext);
    return getRenderPage(brand, props);
};

ComponentToRender.getInitialProps = async ctx => {
    return TAndCPage.getInitialProps && TAndCPage.getInitialProps(ctx);
};

export default ComponentToRender;
