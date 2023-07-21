import { NextPage } from 'next';
import { isNil, map, reject, reverse } from 'ramda';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import getJobSearchUrl from '../brands/getJobSearchUrl';
import { useClientFromContext } from '../client';
import Button from '../components/bits/Button/Button';
import CenteredSpinner from '../components/bits/Spinner/CenteredSpinner';
import CandidateAreaPageWrapper from '../components/patterns/CandidateArea/CandidateAreaPageWrapper';
import JobApplicationCard from '../components/patterns/CandidateArea/JobApplicationCard';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';
import UserContext from '../components/utils/WithAuth/UserContext';
import { BrandContext } from '../components/utils/WithBrand';
import I18nLink from '../i18n/I18nLink';
import { getJob, Job } from '../queries';
import { QueryType } from '../queries/util';

const JobApplications: NextPage = () => {
    const { t } = useTranslation();
    const { candidateUserDetails, jobApplications } = useContext(UserContext);
    const { brand } = useContext(BrandContext);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(!jobApplications);
    const client = useClientFromContext();

    useEffect(() => {
        if (client && jobApplications) {
            setLoading(true);
            Promise.all(map(jobId => getJob(QueryType.Promise)(client, { reference: jobId }), jobApplications))
                .then(allData => {
                    setJobs(
                        reject(
                            isNil,
                            map(data => data.getJob, allData),
                        ),
                    );
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [jobApplications]);

    if (!candidateUserDetails) {
        return <RestrictedErrorPage />;
    }

    return (
        <CandidateAreaPageWrapper header={t('candidate_applications_header')}>
            {(!jobApplications || (loading && !jobApplications)) && <CenteredSpinner />}
            {!loading && !jobs.length && (
                <div>
                    <p>{t('candidate_applications_notApplied')}</p>
                    <br />
                    <I18nLink href={{ pathname: getJobSearchUrl(brand) }} passHref>
                        <Button as="a" className="search-for-jobs" type="text/html">
                            {t('candidate_savedJobs_searchJobsCTA')}
                        </Button>
                    </I18nLink>
                </div>
            )}
            {map(
                job => (
                    <JobApplicationCard key={job.reference} job={job} />
                ),
                reverse(jobs),
            )}
        </CandidateAreaPageWrapper>
    );
};

export default JobApplications;
