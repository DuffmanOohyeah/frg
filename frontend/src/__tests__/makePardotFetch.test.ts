import {
    setEndPointValues,
    getEndpointValues,
    mapFormFields,
    makeFormString,
    doPardotFetch,
    clearEndpointValues,
} from '../pardot/makePardotFetch';

beforeEach(() => {
    jest.spyOn(window, 'fetch');
    jest.resetModules();
    clearEndpointValues();
});

describe('makePardotFetch/setEndPointValues', () => {
    test('should set endpoints if they are valid', async () => {
        setEndPointValues({ signIn: { endpoint: 'test' } });
        const endpoints = getEndpointValues();
        expect(endpoints).toMatchObject({ signIn: { endpoint: 'test' } });
    });

    test('should throw if empty endpoint', async () => {
        expect(() => setEndPointValues({ signIn: { endpoint: '' } })).toThrow("No endpoint found for form 'signIn'");
    });
});

describe('makePardotFetch/setDevPardotEndpointValues', () => {
    test('should set training endpoints', async () => {
        jest.mock('../pardot/formHandlerEndpoints/training/jefferson', () => ({
            signIn: { endpoint: 'trainingEndpoint' },
        }));

        jest.mock('../pardot/formHandlerEndpoints/jefferson', () => ({
            signIn: { endpoint: 'productionEndpoint' },
        }));

        return import('../pardot/makePardotFetch').then(async mockedMakePardotFetch => {
            await mockedMakePardotFetch.setDevPardotEndpointValues('Jefferson');
            const endpoints = mockedMakePardotFetch.getEndpointValues();
            expect(endpoints).toMatchObject({ signIn: { endpoint: 'trainingEndpoint' } });
        });
    });

    test('should set training endpoints using brand', async () => {
        jest.mock('../pardot/formHandlerEndpoints/training/jefferson', () => ({
            signIn: { endpoint: 'jeffersonEndpoint' },
        }));

        jest.mock('../pardot/formHandlerEndpoints/training/nelson', () => ({
            signIn: { endpoint: 'nelsonEndpoint' },
        }));

        return import('../pardot/makePardotFetch').then(async mockedMakePardotFetch => {
            await mockedMakePardotFetch.setDevPardotEndpointValues('Nelson');
            const endpoints = mockedMakePardotFetch.getEndpointValues();
            expect(endpoints).toMatchObject({ signIn: { endpoint: 'nelsonEndpoint' } });
        });
    });

    test('should set production endpoints', async () => {
        jest.mock('../pardot/formHandlerEndpoints/training/jefferson', () => ({
            signIn: { endpoint: 'trainingEndpoint' },
        }));

        jest.mock('../pardot/formHandlerEndpoints/jefferson', () => ({
            signIn: { endpoint: 'productionEndpoint' },
        }));

        return import('../pardot/makePardotFetch').then(async mockedMakePardotFetch => {
            await mockedMakePardotFetch.setPardotEndpointValues('Jefferson');
            const endpoints = mockedMakePardotFetch.getEndpointValues();
            expect(endpoints).toMatchObject({ signIn: { endpoint: 'productionEndpoint' } });
        });
    });

    test('should set production endpoints using brand', async () => {
        jest.mock('../pardot/formHandlerEndpoints/washington', () => ({
            signIn: { endpoint: 'washingtonEndpoint' },
        }));

        jest.mock('../pardot/formHandlerEndpoints/anderson', () => ({
            signIn: { endpoint: 'andersonEndpoint' },
        }));

        return import('../pardot/makePardotFetch').then(async mockedMakePardotFetch => {
            await mockedMakePardotFetch.setPardotEndpointValues('Washington');
            const endpoints = mockedMakePardotFetch.getEndpointValues();
            expect(endpoints).toMatchObject({ signIn: { endpoint: 'washingtonEndpoint' } });
        });
    });
});

describe('makePardotFetch/mapFormFields', () => {
    test('should throw if form fields and field mappings are not 1:1', async () => {
        expect(() => mapFormFields({ __test: 'test' }, { __bar: 'bar' })).toThrow('Field mappings are not 1:1');
    });

    test('should replace field names with equal equivalent', async () => {
        const results = mapFormFields({ __test: 'test' }, { __test: 'aFieldName' });
        expect(results).toMatchObject({ aFieldName: 'test' });
    });

    test('should not replace field names if there is no match', async () => {
        const results = mapFormFields({ __test: 'test', foobar: 123 }, { __test: 'aFieldName' });
        expect(results).toMatchObject({ aFieldName: 'test', foobar: 123 });
    });
});

describe('makePardotFetch/makeFormString', () => {
    test('should make formstring from form data', async () => {
        const result = makeFormString({}, { foo: 'bar', field: 'value' }, {});
        expect(result).toEqual('foo=bar&field=value');
    });

    test('should use default formdata if falsey value provided', async () => {
        const result = makeFormString({ foo: 'default' }, { foo: '', field: 'value' }, {});
        expect(result).toEqual('foo=default&field=value');
    });

    test('should not use default formdata if truthy value provided', async () => {
        const result = makeFormString({ foo: 'default' }, { foo: 'theTruth', field: 'value' }, {});
        expect(result).toEqual('foo=theTruth&field=value');
    });
});

describe('makePardotFetch/doPardotFetch', () => {
    test('should error if no endpoints', async () => {
        expect(
            doPardotFetch({ name: 'formName', endpointKey: 'endpointKey' }, { field: 'value' }),
        ).rejects.toThrowError('endPointValues has not been set up');
    });

    test('should return true for successful fetch', async () => {
        jest.spyOn(window, 'fetch').mockImplementation(() => Promise.resolve(new Response()));

        setEndPointValues({ signIn: { endpoint: 'testEndpoint' } });
        const result = await doPardotFetch({ name: 'form Name', endpointKey: 'signIn' }, { field: 'value' });
        expect(window.fetch).toHaveBeenCalledWith('testEndpoint', {
            body: 'field=value',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            mode: 'no-cors',
        });
        expect(result).toEqual(true);
    });

    test('should return false for failed fetch', async () => {
        jest.spyOn(window, 'fetch').mockImplementation(() => Promise.reject("Posting form 'form Name' has failed"));

        setEndPointValues({ signIn: { endpoint: 'testEndpoint' } });
        const result = await doPardotFetch({ name: 'form Name', endpointKey: 'signIn' }, { field: 'value' });
        expect(window.fetch).toHaveBeenCalledWith('testEndpoint', {
            body: 'field=value',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            mode: 'no-cors',
        });
        expect(result).toEqual(false);
    });
});
