import getGeneratedJobSearchUrl from '../utils/findGeneratedJobSearchUrl';

describe('getGeneratedJobSearchUrl', () => {
    describe('when passed empty strings as props', () => {
        it('returns undefined', () => {
            expect(getGeneratedJobSearchUrl('')('')).toEqual(undefined);
        });
    });

    describe('when passed an empty string as the path and a prefix', () => {
        it('returns undefined', () => {
            expect(getGeneratedJobSearchUrl('')('/aws')).toEqual(undefined);
        });
    });

    describe('when passed a path and an empty string for the prefix', () => {
        it('returns undefined', () => {
            expect(getGeneratedJobSearchUrl('/aws')('')).toEqual(undefined);
        });
    });

    describe('when passed a path which does not include the filter text and a prefix', () => {
        it('returns false', () => {
            expect(getGeneratedJobSearchUrl('/aws')('/aws')).toEqual(false);
        });
    });

    describe('when passed a path which includes filter text, but does not start with prefix', () => {
        it('returns false', () => {
            expect(getGeneratedJobSearchUrl('/aws-jobs')('/remote')).toEqual(false);
        });
    });

    describe('when passed a path which includes the filter text and starts with the prefix, and a prefix', () => {
        it('returns true', () => {
            expect(getGeneratedJobSearchUrl('/aws-jobs')('/aws')).toEqual(true);
        });
    });
});
