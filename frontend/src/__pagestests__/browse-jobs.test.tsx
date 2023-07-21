import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import BrowseJobsPage from '../pages/browse-jobs';
import theme, { NelsonThemeLogos } from '../themes/Nelson';
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

describe('pages/browse-jobs', () => {
    test('should render the page', async () => {
        const { getAllByText } = render(
            <BrandProvider value={{ brand: 'Jefferson', brandData }}>
                <ThemeProvider theme={{ ...theme, ...NelsonThemeLogos }}>
                    <BrowseJobsPage />
                </ThemeProvider>
            </BrandProvider>,
        );
        // Look for translation key instead of actual human words cause that
        // will be flimsy from brand to brand
        const heading = await getAllByText('browseJobs_header');
        expect(heading.length).toBeGreaterThanOrEqual(1); // browseJobs_header is also in breadcrumbs
    });
});
