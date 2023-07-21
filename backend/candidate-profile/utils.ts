import { Identity } from './Identity';

const stringRepeat = (str: string, repeats: number): string => {
    const parts: Array<string> = [];
    for (let i = 0; i < repeats; ++i) {
        parts.push(str);
    }
    return parts.join('');
};

/* scrub the string by replacing the middle portion with asterisks. */
const scrubString = (scrubStartFraction: number, scrubEndFraction: number) => (str: string): string => {
    const len = str.length;
    const startIndex = Math.floor(scrubStartFraction * len);
    const endIndex = Math.ceil(scrubEndFraction * len);
    // Three portions:
    // - First has length startIndex
    // - Second has length endIndex-startIndex
    // - Third has length strlen - endIndex
    return str.slice(0, startIndex) + stringRepeat('*', endIndex - startIndex) + str.slice(endIndex, Infinity);
};

/* Pseudo-anonymise email addresses by replacing a portion of the local part with asterisks. */
export const scrubEmailAddress = (email: string): string => {
    return email
        .split('@')
        .map(scrubString(0.35, 0.65))
        .join('@');
};

export const isCandidate = (identity: Identity): boolean => {
    const isCandidate = identity.claims['custom:userType'] === 'Candidate' && !identity.claims['custom:ssoUserType'];
    const isSSOCandidate = !identity.claims['custom:userType'] && identity.claims['custom:ssoUserType'] === 'Candidate';
    return isCandidate || isSSOCandidate;
};
