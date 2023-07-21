import { join, keys, reduce } from 'ramda';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const objectToUrlQuery = (o: Record<string, any>): string =>
    reduce(
        (query, key) => {
            const value = o[key];
            if (typeof value === 'string' && value) {
                return `${query}&${key}=${value}`;
            } else if (Array.isArray(value)) {
                const arrayValues = join(`&${key}=`, ['', ...value]);
                return `${query}${arrayValues}`;
            } else if (typeof value === 'boolean' && value) {
                return `${query}&${key}=true`;
            }
            return query;
        },
        '',
        keys(o),
    );

export default objectToUrlQuery;
