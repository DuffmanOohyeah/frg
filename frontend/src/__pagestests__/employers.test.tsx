import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import staticTheme from '../themes/Nigel';
import dynamicTheme from '../themes/Tech';
import EmployersPage from '../pages/employers';
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
        bodyHtml: 'employersContent',
        title: 'title',
        author: 'author',
        categories: [],
        excerptHtml: 'excerptHtml',
        publishedGmt: 'publishedGmt',
        modifiedGmt: 'modifiedGmt',
        slug: 'slug',
    },
};

describe('pages/employers', () => {
    test('should render the page based on fetched static content', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Nigel', brandData }}>
                <ThemeProvider theme={staticTheme}>
                    <EmployersPage config={fakeConfig} page={fakePage} />
                </ThemeProvider>
            </BrandProvider>,
        );
        const heading = await getAllByText('pageNav_home');
        expect(heading.length).toEqual(1);
    });
});

describe('pages/employers', () => {
    test('should render the page based on fetched dynamic content', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'FrgTech', brandData }}>
                <ThemeProvider theme={dynamicTheme}>
                    <EmployersPage config={fakeConfig} page={fakePage} />
                </ThemeProvider>
            </BrandProvider>,
        );
        const heading = await getAllByText('pageNav_home');
        expect(heading.length).toEqual(1);
    });
});
