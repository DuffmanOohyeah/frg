import { pipe, replace, toLower } from 'ramda';

const formatJobTitleForUrl = (title: string): string =>
    pipe(
        replace(/\s+/g, '-'),
        replace(/-+/g, '-'),
        replace(/\//g, '-'),
        replace(/[^a-zA-Z\d\+\-]/g, ''),
        toLower,
    )(title);

export default formatJobTitleForUrl;
