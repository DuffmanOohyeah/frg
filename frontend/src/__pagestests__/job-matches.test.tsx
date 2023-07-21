import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import CandidateJobMatchesPage from '../pages/job-matches';
import theme from '../themes/Nelson';
import UserContext, { defaultUserContext } from '../components/utils/WithAuth/UserContext';
import { defaultEmployerUserDetails } from '../components/utils/WithAuth/EmployerDetails';
import { testCandidateUserDetails } from '../components/utils/WithAuth/CandidateDetails';

jest.mock('@apollo/react-hooks', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useLazyQuery: (): any => [(): undefined => undefined, { data: undefined, loading: false }],
}));

describe('pages/job-matches', () => {
    test('should render the page if candidate', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                    candidateUserDetails: testCandidateUserDetails,
                }}
            >
                <ThemeProvider theme={theme}>
                    <CandidateJobMatchesPage />
                </ThemeProvider>
                ,
            </UserContext.Provider>,
        );
        const heading = await getAllByText('candidate_jobMatches_header');
        expect(heading.length).toEqual(1);
    });

    test('should not render the page if not candidate', async () => {
        const { getAllByText } = render(
            <UserContext.Provider
                value={{
                    ...defaultUserContext,
                    employerUserDetails: defaultEmployerUserDetails,
                }}
            >
                <ThemeProvider theme={theme}>
                    <CandidateJobMatchesPage />
                </ThemeProvider>
                ,
            </UserContext.Provider>,
        );
        const heading = await getAllByText('errorPage_restricted_header');
        expect(heading.length).toEqual(1);
    });
});
