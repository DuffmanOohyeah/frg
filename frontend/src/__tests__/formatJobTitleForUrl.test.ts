import formatJobTitleForUrl from '../utils/formatJobTitleForUrl';

describe('formatJobTitle', () => {
    it('returns an empty string when passed an empty string', () => {
        expect(formatJobTitleForUrl('')).toEqual('');
    });

    it('replaces single spaces with a dash', () => {
        expect(formatJobTitleForUrl(' ')).toEqual('-');
    });

    it('replaces double spaces with a dash', () => {
        expect(formatJobTitleForUrl('  ')).toEqual('-');
    });

    it('replaces forward slashes with a dash', () => {
        expect(formatJobTitleForUrl('a/b/c')).toEqual('a-b-c');
    });

    it('removes special characters that are not dashes, pluses or numbers/characters', () => {
        expect(formatJobTitleForUrl('ab[]cd+ef-()')).toEqual('abcd+ef-');
    });

    it('makes an upper case string a lower case string', () => {
        expect(formatJobTitleForUrl('AwsExpert')).toEqual('awsexpert');
    });
});
