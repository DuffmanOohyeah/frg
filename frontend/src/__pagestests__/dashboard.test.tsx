import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import CandidateDashboardPage from '../pages/dashboard';
import theme from '../themes/Nelson';
import UserContext, { defaultUserContext } from '../components/utils/WithAuth/UserContext';
import { defaultEmployerUserDetails } from '../components/utils/WithAuth/EmployerDetails';
import { testCandidateUserDetails } from '../components/utils/WithAuth/CandidateDetails';

jest.mock('@apollo/react-hooks', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useLazyQuery: (): any => [(): undefined => undefined, { data: undefined, loading: false }],
}));

describe('pages/dashboard', () => {
    test('should not render the page if no user', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                }}
            >
                <ThemeProvider theme={theme}>
                    <CandidateDashboardPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('errorPage_restricted_header');
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
                    <CandidateDashboardPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('errorPage_restricted_header');
        expect(heading.length).toEqual(1);
    });

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
                    <CandidateDashboardPage />
                </ThemeProvider>
            </UserContext.Provider>,
        );
        const heading = await getAllByText('candidate_dashboard_header');
        expect(heading.length).toEqual(1);
    });
});
