import objectToUrlQuery from '../utils/objectToUrlQuery';

describe('objectToUrlQuery', () => {
    test('should work for string values', async () => {
        const query = objectToUrlQuery({ key: 'stringValue' });
        expect(query).toEqual('&key=stringValue');
    });

    test('should work for string array values', async () => {
        const query = objectToUrlQuery({ foobar: ['a', 'b', 'c'] });
        expect(query).toEqual('&foobar=a&foobar=b&foobar=c');
    });

    test('should work for boolean values if they are true', async () => {
        const queryFalse = objectToUrlQuery({ foobar: false });
        expect(queryFalse).toEqual('');

        const queryTrue = objectToUrlQuery({ foobar: true });
        expect(queryTrue).toEqual('&foobar=true');
    });

    test('should work for boolean values if is a mix of things', async () => {
        const query = objectToUrlQuery({ a: true, b: 'string', c: ['a', 'b'] });
        expect(query).toEqual('&a=true&b=string&c=a&c=b');
    });
});
