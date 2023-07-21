import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import CandidateJobApplicationsPage from '../pages/job-applications';
import theme from '../themes/Nelson';
import UserContext, { defaultUserContext } from '../components/utils/WithAuth/UserContext';
import { testCandidateUserDetails } from '../components/utils/WithAuth/CandidateDetails';

describe('pages/job-applications', () => {
    test('should render the page if candidate', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                    employerUserDetails: undefined,
                    candidateUserDetails: testCandidateUserDetails,
                }}
            >
                <ThemeProvider theme={theme}>
                    <CandidateJobApplicationsPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('candidate_applications_header');
        expect(heading.length).toEqual(1);
    });

    test('should not render the page if not candidate', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                }}
            >
                <ThemeProvider theme={theme}>
                    <CandidateJobApplicationsPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('errorPage_restricted_header');
        expect(heading.length).toEqual(1);
    });
});
