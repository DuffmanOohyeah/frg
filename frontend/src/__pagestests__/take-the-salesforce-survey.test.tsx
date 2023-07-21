import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import MasonSalesforceSurveyPage from '../components/pages/Mason/take-the-salesforce-survey';
import masonTheme from '../themes/Mason';
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

describe('insights/take-the-salesforce-survey', () => {
    test('should render the MFI salesforce survey page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Mason', brandData }}>
                <ThemeProvider theme={masonTheme}>
                    <MasonSalesforceSurveyPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that will be flimsy from brand to brand
        const heading = await getAllByText('salesforceSurvey_welcome_tsAndCs');
        expect(heading.length).toEqual(1);
    });
});
