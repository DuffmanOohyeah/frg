import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import MasonCahgPage from '../components/pages/Mason/cahg';
import AndersonCahgPage from '../components/pages/Anderson/cahg';
import masonTheme from '../themes/Mason';
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

describe('insights/salesforce-careers-and-hiring-guide', () => {
    test('should render the MFI CAHG page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Mason', brandData }}>
                <ThemeProvider theme={masonTheme}>
                    <MasonCahgPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that
        // will be flimsy from brand to brand
        const heading = await getAllByText('cahg_welcome_header');
        expect(heading.length).toEqual(1);
    });
});

describe('insights/netsuite-careers-and-hiring-guide', () => {
    test('should render the AFI CAHG page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Anderson', brandData }}>
                <ThemeProvider theme={andersonTheme}>
                    <AndersonCahgPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that
        // will be flimsy from brand to brand
        const heading = await getAllByText('cahg_welcome_header');
        expect(heading.length).toEqual(1);
    });
});
