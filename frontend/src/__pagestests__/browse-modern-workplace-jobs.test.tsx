import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import BrowseModernWorkplaceJobsPage from '../pages/browse-modern-workplace-jobs';
import theme, { NigelThemeLogos } from '../themes/Nigel';
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

describe('pages/browse-modern-workplace-jobs', () => {
    test('should render the page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Nigel', brandData }}>
                <ThemeProvider theme={{ ...theme, ...NigelThemeLogos }}>
                    <BrowseModernWorkplaceJobsPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that
        // will be flimsy from brand to brand
        const heading = await getAllByText('browseModernWorkplaceJobs_pageTitle');
        expect(heading.length).toBeGreaterThanOrEqual(1); // browseJobs_header is also in breadcrumbs
    });
});
