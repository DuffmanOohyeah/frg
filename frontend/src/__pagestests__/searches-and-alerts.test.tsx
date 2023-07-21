import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import SearchesAndAlertsPage from '../pages/searches-and-alerts';
import theme from '../themes/Nelson';
import UserContext, { defaultUserContext } from '../components/utils/WithAuth/UserContext';
import { defaultEmployerUserDetails } from '../components/utils/WithAuth/EmployerDetails';
import { testCandidateUserDetails } from '../components/utils/WithAuth/CandidateDetails';

describe('pages/searches-and-alerts', () => {
    test('should not render the page if no user', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                }}
            >
                <ThemeProvider theme={theme}>
                    <SearchesAndAlertsPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('errorPage_restricted_header');
        expect(heading.length).toEqual(1);
    });

    test('should render employer component if employer', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                    employerUserDetails: defaultEmployerUserDetails,
                    candidateUserDetails: undefined,
                }}
            >
                <ThemeProvider theme={theme}>
                    <SearchesAndAlertsPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('employer_savedSearches_header');
        expect(heading.length).toEqual(1);
    });

    test('should render candidate component if candidate', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                    employerUserDetails: undefined,
                    candidateUserDetails: testCandidateUserDetails,
                }}
            >
                <ThemeProvider theme={theme}>
                    <SearchesAndAlertsPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('candidate_savedSearches_header');
        expect(heading.length).toEqual(1);
    });
});
