import { TFunction } from 'i18next';
import { always, cond, equals } from 'ramda';
import { JobType } from '../types';

// Unfortunately our app uses the JobType enums but the job data we actually get does not
// so we need to account for the enum being used and for the job data returning
// types capitalised
export const jobTypeToDisplayString = (t: TFunction, jobType: JobType | string): string =>
    cond<string, string>([
        [equals(JobType.Permanent.valueOf()), always(t('Permanent'))],
        [equals('Permanent'), always(t('Permanent'))],
        [equals(JobType.Contract.valueOf()), always(t('Contract'))],
        [equals('Contract'), always(t('Contract'))],
        [equals(JobType.Both.valueOf()), always(t('PermanentAndContract'))],
        [equals('Permanent and Contract'), always(t('PermanentAndContract'))],
    ])(jobType);
