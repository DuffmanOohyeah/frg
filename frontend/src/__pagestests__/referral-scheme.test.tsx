import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../themes/Nelson';
import ReferralSchemePage from '../pages/referral-scheme';

const fakeConfig = {
    graphqlUrl: 'graphqlUrl',
    apiKey: 'apiKey',
    awsRegion: 'awsRegion',
    userPoolId: 'userPoolId',
    userPoolClientId: 'userPoolClientId',
    userPoolOAuthDomain: 'userPoolOAuthDomain',
    brand: 'brand',
};

const fakePage = {
    getContentPage: {
        bodyHtml: 'referralContent',
        title: 'title',
        author: 'author',
        categories: [],
        excerptHtml: 'excerptHtml',
        publishedGmt: 'publishedGmt',
        modifiedGmt: 'modifiedGmt',
        slug: 'slug',
    },
};

describe('pages/contact', () => {
    test('should render the page based on fetched content', async () => {
        const { getAllByText } = render(
            <ThemeProvider theme={theme}>
                <ReferralSchemePage config={fakeConfig} page={fakePage} />
            </ThemeProvider>,
        );
        const heading = await getAllByText('referralContent');
        expect(heading.length).toEqual(1);
    });
});
