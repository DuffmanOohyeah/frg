import React, { useContext, useEffect } from 'react';
import { NextPage } from 'next';
import CandidateAreaPageWrapper from '../components/patterns/CandidateArea/CandidateAreaPageWrapper';
import JobListing from '../components/patterns/JobListing/JobListing';
import { searchJobs } from '../queries';
import Heading from '../components/bits/Headings/Headings';
import Count from '../components/bits/Count/Count';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import UserContext from '../components/utils/WithAuth/UserContext';
import { QueryType } from '../queries/util';
import CenteredSpinner from '../components/bits/Spinner/CenteredSpinner';
import { map } from 'ramda';
import JobDescription from '../components/bits/JobDescription/JobDescription';
import { makeSearchFromCandidateProfile } from '../utils/makeSearchFromCandidateProfile';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';

const JobMatchListing = styled(JobListing)`
    @media screen and (max-width: 650px) {
        .jobDetail {
            flex-direction: column;

            > * {
                margin-bottom: 2rem;
                width: 100%;
            }
        }
    }
`;

const JobMatchesPage: NextPage = () => {
    const { t } = useTranslation();
    const { candidateUserDetails } = useContext(UserContext);
    const [lazySearchJobs, { data: jobMatchesResults, loading: loadingJobMatches }] = searchJobs(QueryType.Lazyhook)();

    useEffect(() => {
        if (candidateUserDetails) {
            lazySearchJobs({ variables: makeSearchFromCandidateProfile(candidateUserDetails) });
        }
    }, [candidateUserDetails]);

    if (!candidateUserDetails) {
        return <RestrictedErrorPage />;
    }

    const jobMatches = jobMatchesResults && jobMatchesResults.searchJobs.items;

    return (
        <CandidateAreaPageWrapper header={t('candidate_jobMatches_header')}>
            {loadingJobMatches && <CenteredSpinner />}
            {jobMatches && (
                <>
                    <Heading as="h2" size="gamma" className="heading">
                        <Trans
                            i18nKey="candidate_jobMatches_foundJobs"
                            components={{ jobCounter: <Count count={jobMatches.length} /> }}
                        />
                    </Heading>
                    {map(
                        job => (
                            <JobMatchListing key={job.reference} job={job}>
                                <JobDescription contents={job.description} isSummary={true} />
                            </JobMatchListing>
                        ),
                        jobMatches,
                    )}
                </>
            )}
        </CandidateAreaPageWrapper>
    );
};

export default JobMatchesPage;
