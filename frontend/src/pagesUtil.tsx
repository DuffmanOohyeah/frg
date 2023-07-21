// Note: this file is named with a leading _ so that next doesn't think it is a page
import { ParsedUrlQuery } from 'querystring';
import { Config } from './client';

interface WithConfig {
    config: Config;
}

export const includeConfig = <A extends Record<string, unknown>>(config: Config) => (obj: A): A & WithConfig => ({
    ...obj,
    config,
});

export const getOptionalSingleQueryParam = (query: ParsedUrlQuery, attr: string): string | undefined => {
    const value = query[attr];
    if (typeof value === 'string') {
        return value;
    } else if (Array.isArray(value)) {
        return value[0];
    }
    return undefined;
};

export const getSingleQueryParam = (
    query: ParsedUrlQuery,
    attr: string,
    defaultValue: string | undefined = undefined,
): string => {
    const value = getOptionalSingleQueryParam(query, attr);
    if (typeof value === 'string') {
        return value;
    }
    if (typeof defaultValue !== 'undefined') {
        return defaultValue;
    }
    throw new Error(`Missing query param ${attr}`);
};

export const getSingleIntegerQueryParam = (
    query: ParsedUrlQuery,
    attr: string,
    defaultValue: number | undefined = undefined,
): number => {
    const stringValue = getOptionalSingleQueryParam(query, attr);
    if (typeof stringValue === 'string') {
        const intValue = parseInt(stringValue, 10);
        if (typeof intValue === 'number') {
            return intValue;
        }
    }
    if (typeof defaultValue !== 'undefined') {
        return defaultValue;
    }
    throw new Error(`Missing or invalid query param ${attr}`);
};

export const getOptionalMultiQueryParam = (query: ParsedUrlQuery, attr: string): string[] => {
    const value = query[attr];
    if (Array.isArray(value)) return value;
    else if (typeof value === 'string') return [value];
    return [];
};

export const getOptionalBoolQueryParam = (query: ParsedUrlQuery, attr: string): boolean | undefined => {
    const value = query[attr];
    if (value === 'true') {
        return true;
    } else if (value === 'false') {
        return false;
    }
    return undefined;
};
