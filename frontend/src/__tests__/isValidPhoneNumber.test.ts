import isValidPhoneNumber from '../utils/isValidPhoneNumber';

// Rules from https://frankgroup.atlassian.net/browse/NGW-381
describe('isValidPhoneNumber', () => {
    test('should return false if string containsless than 5 digits', async () => {
        const value = '12345';

        const result = isValidPhoneNumber(value);
        expect(result).toEqual(false);

        const value2 = '+12345';

        const result2 = isValidPhoneNumber(value2);
        expect(result2).toEqual(true);
    });

    test('should return true if string contains letters', async () => {
        const value = '123456a';

        const result = isValidPhoneNumber(value);
        expect(result).toEqual(true);
    });
    test('should return true if string contains spaces', async () => {
        const value = '1 234 56';

        const result = isValidPhoneNumber(value);
        expect(result).toEqual(true);

        const value2 = '+12 3 4 5 6';

        const result2 = isValidPhoneNumber(value2);
        expect(result2).toEqual(true);
    });
});
