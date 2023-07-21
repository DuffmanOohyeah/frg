import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import RegisterPage from '../pages/register';
import theme from '../themes/Nelson';
import { BrandProvider } from '../components/utils/WithBrand';

const defaultConfig = {
    graphqlUrl: 'graphqlUrl',
    apiKey: 'apiKey',
    awsRegion: 'awsRegion',
    contentDomain: 'contentDomain',
    userPoolId: 'userPoolId',
    userPoolClientId: 'userPoolClientId',
    userPoolOAuthDomain: 'userPoolOAuthDomain',
    redirectSignInUrl: 'redirectSignInUrl',
    redirectSignOutUrl: 'redirectSignOutUrl',
    brand: 'Jefferson',
};

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

describe('pages/register', () => {
    test('should render the page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Jefferson', brandData }}>
                <ThemeProvider theme={theme}>
                    <RegisterPage data={defaultConfig} />
                </ThemeProvider>
            </BrandProvider>,
        );
        const heading = await getAllByText('registerProcess_typeStep_tagline');
        expect(heading.length).toEqual(1);
    });
});
