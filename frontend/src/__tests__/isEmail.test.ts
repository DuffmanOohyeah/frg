import {
    atLeastOneCharAfterAtSymbol,
    atLeastOneCharBeforeAtSymbol,
    containsAtLeastOneAtSymbol,
} from '../utils/isEmail';

describe('isEmail/containsAtLeastOneAtSymbol', () => {
    test('should return false if string does not contain @ symbol', async () => {
        const value = 'foobar';

        const result = containsAtLeastOneAtSymbol(value);
        expect(result).not.toBeTruthy();
    });

    test('should return true if string does contain @ symbol', async () => {
        const value = 'test@test.com';

        const result = containsAtLeastOneAtSymbol(value);
        expect(result).toBeTruthy();
    });
});

describe('isEmail/atLeastOneCharBeforeAtSymbol', () => {
    test('should return false if string does not contain @ symbol', async () => {
        const value = 'test.com';

        const result = atLeastOneCharBeforeAtSymbol(value);
        expect(result).not.toBeTruthy();
    });

    test('should return false if string does not contain at least one char before @ symbol', async () => {
        const value = '@test.com';

        const result = atLeastOneCharBeforeAtSymbol(value);
        expect(result).not.toBeTruthy();
    });

    test('should return true if string does contain at least one char before @ symbol', async () => {
        const value = 't@test.com';

        const result = atLeastOneCharBeforeAtSymbol(value);
        expect(result).toBeTruthy();
    });
});

describe('isEmail/atLeastOneCharAfterAtSymbol', () => {
    test('should return false if string does not contain @ symbol', async () => {
        const value = 'test.com';

        const result = atLeastOneCharAfterAtSymbol(value);
        expect(result).not.toBeTruthy();
    });

    test('should return false if string does not contain at least one char after @ symbol', async () => {
        const value = 'test@';

        const result = atLeastOneCharAfterAtSymbol(value);
        expect(result).not.toBeTruthy();
    });

    test('should return true if string does contain at least one char after @ symbol', async () => {
        const value = 'test@test.com';

        const result = atLeastOneCharAfterAtSymbol(value);
        expect(result).toBeTruthy();
    });
});
