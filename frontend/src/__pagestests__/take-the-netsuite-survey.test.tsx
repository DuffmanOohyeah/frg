import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import AndersonNetsuiteSurveyPage from '../components/pages/Anderson/take-the-netsuite-survey';
import andersonTheme from '../themes/Anderson';
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

describe('insights/take-the-netsuite-survey', () => {
    test('should render the AFI netsuite survey page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Anderson', brandData }}>
                <ThemeProvider theme={andersonTheme}>
                    <AndersonNetsuiteSurveyPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that will be flimsy from brand to brand
        const heading = await getAllByText('netsuiteSurvey_welcome_header');
        expect(heading.length).toEqual(1);
    });
});
