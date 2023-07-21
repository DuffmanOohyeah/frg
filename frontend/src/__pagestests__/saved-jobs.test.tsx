import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import CandidateSavedJobsPage from '../pages/saved-jobs';
import UserContext, { defaultUserContext } from '../components/utils/WithAuth/UserContext';
import { defaultEmployerUserDetails } from '../components/utils/WithAuth/EmployerDetails';
import { testCandidateUserDetails } from '../components/utils/WithAuth/CandidateDetails';
import theme from '../themes/Nelson';

describe('pages/saved-jobs', () => {
    test('should render anon saved jobs if no user', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                }}
            >
                <ThemeProvider theme={theme}>
                    <CandidateSavedJobsPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('anonSavedJobs_header');
        expect(heading.length).toEqual(1);
    });

    test('should render candidate saved jobs if candidate', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                    employerUserDetails: undefined,
                    candidateUserDetails: testCandidateUserDetails,
                }}
            >
                <ThemeProvider theme={theme}>
                    <CandidateSavedJobsPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('candidate_savedJobs_header');
        expect(heading.length).toEqual(1);
    });

    test('should not render the page if employer', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                    employerUserDetails: defaultEmployerUserDetails,
                    candidateUserDetails: undefined,
                }}
            >
                <ThemeProvider theme={theme}>
                    <CandidateSavedJobsPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('errorPage_restricted_header');
        expect(heading.length).toEqual(1);
    });
});
