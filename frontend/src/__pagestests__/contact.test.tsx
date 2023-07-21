import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ContactPage from '../pages/contact';
import theme from '../themes/Nelson';
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

describe('pages/contact', () => {
    test('should render the page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Nelson', brandData }}>
                <ThemeProvider theme={theme}>
                    <ContactPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that
        // will be flimsy from brand to brand
        const heading = await getAllByText('contactPage_header');
        expect(heading.length).toEqual(1);
    });
});
