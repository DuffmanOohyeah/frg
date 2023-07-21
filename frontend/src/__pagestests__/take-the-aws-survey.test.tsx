import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import JFIServiceNowCahgPage from '../components/pages/Jefferson/take-the-aws-survey';
import jfiTheme from '../themes/Jefferson';
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

describe('insights/take-the-aws-survey', () => {
    test('should render the JFI Aws Survey page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Jefferson', brandData }}>
                <ThemeProvider theme={jfiTheme}>
                    <JFIServiceNowCahgPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that will be flimsy from brand to brand
        const heading = await getAllByText('awsSurvey_hero_child');
        expect(heading.length).toEqual(1);
    });
});
