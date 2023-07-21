import React, { useContext } from 'react';
import { BrandContext } from '../components/utils/WithBrand';
import FromWpPage from '../components/pages/FromWpPage/FromWpPage';
import { cond, equals, always, T } from 'ramda';
import styled from 'styled-components';
import { Config } from '../client';
import { GetContentPageQueryData } from '../queries';

const ThanksForYourFeedbackPage = FromWpPage('/thanks-for-your-feedback');

interface FeedbackProps {
    config: Config;
    page: GetContentPageQueryData;
}

const NigelFeedbackPage = styled.span`
    .breadcrumbs {
        color: ${props => props.theme.colors.white};
    }
`;

const getRenderPage = (brand: string, props: FeedbackProps) =>
    cond<string, JSX.Element>([
        [
            equals('Nigel'),
            always(
                <NigelFeedbackPage>
                    <ThanksForYourFeedbackPage {...props} />
                </NigelFeedbackPage>,
            ),
        ],
        [T, always(<ThanksForYourFeedbackPage {...props} />)],
    ])(brand);

const ComponentToRender = (props: FeedbackProps) => {
    const { brand } = useContext(BrandContext);
    return getRenderPage(brand, props);
};

ComponentToRender.getInitialProps = async ctx => {
    return ThanksForYourFeedbackPage.getInitialProps && ThanksForYourFeedbackPage.getInitialProps(ctx);
};

export default ComponentToRender;
