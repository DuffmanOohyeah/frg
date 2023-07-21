import { ParsedUrlQuery } from 'querystring';
import { SearchFormQuery } from '../components/patterns/SearchForm/SearchForm';
import {
    getOptionalBoolQueryParam,
    getOptionalMultiQueryParam,
    getSingleIntegerQueryParam,
    getSingleQueryParam,
} from '../pagesUtil';
import { JobType } from '../types';
import valueToEnum from './valueToEnum';

export const getQueryParamsForJobs = (query: ParsedUrlQuery): SearchFormQuery => {
    const keyword = getSingleQueryParam(query, 'keyword', '');
    const location = getSingleQueryParam(query, 'location', '');
    const role = getOptionalMultiQueryParam(query, 'role');
    const level = getOptionalMultiQueryParam(query, 'level');
    const jobTypeUnchecked = getSingleQueryParam(query, 'jobType', '');
    const jobType = valueToEnum<typeof JobType>(JobType, jobTypeUnchecked) || JobType.Both;
    const page = getSingleIntegerQueryParam(query, 'page', 1);
    const remote = getOptionalBoolQueryParam(query, 'remote');
    const security = getOptionalBoolQueryParam(query, 'security');
    const newJobs = getOptionalBoolQueryParam(query, 'newJobs');
    const salaryFrom = getSingleQueryParam(query, 'salaryFrom', '');
    const salaryTo = getSingleQueryParam(query, 'salaryTo', '');
    const salaryCurrency = getSingleQueryParam(query, 'salaryCurrency', '');
    const segment = getSingleQueryParam(query, 'segment', '');
    const product = getSingleQueryParam(query, 'product', '');
    return {
        keyword,
        location,
        role,
        level,
        jobType,
        page,
        remote,
        security,
        newJobs,
        salaryFrom,
        salaryTo,
        salaryCurrency,
        segment,
        product,
    };
};
