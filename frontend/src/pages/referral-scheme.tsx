import FromWpPage from '../components/pages/FromWpPage/FromWpPage';
import React, { useContext } from 'react';
import { BrandContext } from '../components/utils/WithBrand';
import { Config } from '../client';
import { GetContentPageQueryData } from '../queries';
import { cond, always, T, equals } from 'ramda';
import Container from '../components/utils/Container/Container';

const ReferralSchemePageWP = FromWpPage('/referral-scheme');

interface ReferralSchemePageProps {
    config: Config;
    page: GetContentPageQueryData;
}

const getRenderPage = (brand: string, props: ReferralSchemePageProps) =>
    cond<string, JSX.Element>([
        [
            equals('Nigel'),
            always(
                <Container size="maxWidth">
                    <ReferralSchemePageWP {...props} />
                </Container>,
            ),
        ],
        [T, always(<ReferralSchemePageWP {...props} />)],
    ])(brand);

const ComponentToRender = (props: ReferralSchemePageProps) => {
    const { brand } = useContext(BrandContext);
    return getRenderPage(brand, props);
};

ComponentToRender.getInitialProps = async ctx => {
    return ReferralSchemePageWP.getInitialProps && ReferralSchemePageWP.getInitialProps(ctx);
};

export default ComponentToRender;
