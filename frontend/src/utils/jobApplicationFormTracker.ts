import { GetJobData, Job } from '../queries/getJob';
import { JobType } from '../types';
import { ParsedUrlQuery } from 'querystring';

interface OptionalSearchLocation {
    description?: string;
    country?: string;
    region?: string;
}

interface OptionalJob extends Omit<Partial<Job>, keyof { location }> {
    location: OptionalSearchLocation;
}

interface FormTrackerProps {
    event:
        | 'uploadCV'
        | 'applicationSubmit'
        | 'createAccount'
        | 'jobsByEmailSubmit'
        | 'contactSubmit'
        | 'requestToB'
        | 'requestCV'
        | 'newJobSubmit';
    job?: OptionalJob;
    data?: GetJobData;
    query?: ParsedUrlQuery;
}

const jobApplicationFormTracker = ({ event, job, data, query }: FormTrackerProps) => {
    if (!job) job = data?.getJob;
    const trackerData = {
        id: job?.reference || query?.jobRef || 'unknown',
        location:
            job?.location?.description ||
            job?.location?.region ||
            job?.location?.country ||
            query?.location ||
            'unknown',
        name: job?.title || 'unknown',
        type: job?.type || query?.jobType || JobType.Both,
    };

    if (typeof window !== 'undefined') {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
            event: `${event}`,
            jobID: `${trackerData.id}`,
            jobLocation: `${trackerData.location}`,
            jobName: `${trackerData.name}`,
            jobType: `${trackerData.type}`,
        });
        /* eslint-enable @typescript-eslint/no-explicit-any */
    }
};

export default jobApplicationFormTracker;
