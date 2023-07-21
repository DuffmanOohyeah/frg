import React, { useContext } from 'react';
import { BrandContext } from '../components/utils/WithBrand';
import FromWpPage from '../components/pages/FromWpPage/FromWpPage';
import { Config } from '../client';
import { GetContentPageQueryData } from '../queries';
import { cond, always, T, equals } from 'ramda';
import Container from '../components/utils/Container/Container';
import styled from 'styled-components';

const PreIntroductionTermsPageWP = FromWpPage('/pre-introduction-terms');

interface PreIntroductionTermsPageProps {
    config: Config;
    page: GetContentPageQueryData;
}

const CenteredContainer = styled(Container)`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const getRenderPage = (brand: string, props: PreIntroductionTermsPageProps) =>
    cond<string, JSX.Element>([
        [
            equals('Washington'),
            always(
                <CenteredContainer>
                    <PreIntroductionTermsPageWP {...props} />
                </CenteredContainer>,
            ),
        ],
        [
            equals('FrgTech'),
            always(
                <CenteredContainer>
                    <PreIntroductionTermsPageWP {...props} />
                </CenteredContainer>,
            ),
        ],
        [T, always(<PreIntroductionTermsPageWP {...props} />)],
    ])(brand);

const ComponentToRender = (props: PreIntroductionTermsPageProps) => {
    const { brand } = useContext(BrandContext);
    return getRenderPage(brand, props);
};

ComponentToRender.getInitialProps = async ctx => {
    return PreIntroductionTermsPageWP.getInitialProps && PreIntroductionTermsPageWP.getInitialProps(ctx);
};

export default ComponentToRender;
