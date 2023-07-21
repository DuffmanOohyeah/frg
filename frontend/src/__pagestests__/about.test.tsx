import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../themes/Nelson';
import AboutPage from '../pages/about';
import nigelTheme from '../themes/Nigel';
import { BrandProvider } from '../components/utils/WithBrand';

const brandData = {
    headerData: {
        candidateAccount: [],
        employerAccount: [],
        incompleteAccount: [],
        pages: [],
    },
    candidateVanityUrls: {},
    jobVanityUrls: {},
    theme: {
        name: '',
        colors: {},
        heroes: {},
        icons: {
            submitYourJob: {},
            termsOfBusiness: {},
        },
    },
    footerData: { items: [] },
};
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
        bodyHtml: 'aboutContent',
        title: 'title',
        author: 'author',
        categories: [],
        excerptHtml: 'excerptHtml',
        publishedGmt: 'publishedGmt',
        modifiedGmt: 'modifiedGmt',
        slug: 'slug',
    },
};

describe('pages/about', () => {
    test('should render the page based on fetched static content', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Nigel', brandData }}>
                <ThemeProvider theme={nigelTheme}>
                    <AboutPage config={fakeConfig} page={fakePage} />
                </ThemeProvider>
            </BrandProvider>,
        );
        const heading = await getAllByText('pageNav_home');
        expect(heading.length).toEqual(1);
    });
});

describe('pages/about', () => {
    test('should render the page based on fetched content', async () => {
        const { getAllByText } = render(
            <ThemeProvider theme={theme}>
                <AboutPage config={fakeConfig} page={fakePage} />
            </ThemeProvider>,
        );
        const heading = await getAllByText('aboutContent');
        expect(heading.length).toEqual(1);
    });
});
