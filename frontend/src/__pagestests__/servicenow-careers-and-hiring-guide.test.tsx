import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import NelsonServiceNowCahgPage from '../components/pages/Nelson/servicenow-careers-and-hiring-guide';
import nelsonTheme from '../themes/Nelson';
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

describe('insights/servicenow-careers-and-hiring-guide', () => {
    test('should render the NEL ServiceNow CAHG page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Nelson', brandData }}>
                <ThemeProvider theme={nelsonTheme}>
                    <NelsonServiceNowCahgPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that will be flimsy from brand to brand
        const heading = await getAllByText('serviceNow_hero_button');
        expect(heading.length).toEqual(1);
    });
});
