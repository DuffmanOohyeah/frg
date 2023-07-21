import formatNumber from '../utils/formatNumber';

describe('utils/formatNumber', () => {
    test('should format a string-number to locale specific numeric-currency', () => {
        const args = {
            value: '123456',
            options: {
                currency: 'EUR',
                currencyDisplay: 'symbol',
                style: 'currency',
            },
        };

        const formatCurrency = formatNumber(args);
        expect(formatCurrency).toEqual('€123,456');
    });

    test('should format a string-number to locale specific numeric-currency (with plus)', () => {
        const args = {
            value: '123456+',
            options: {
                currency: 'EUR',
                currencyDisplay: 'symbol',
                style: 'currency',
            },
        };

        const formatCurrency = formatNumber(args);
        expect(formatCurrency).toEqual('€123,456+');
    });

    test('should format a string-number to locale specific numeric-decimal', () => {
        const args = {
            value: '98765.12',
            options: {
                style: 'decimal',
            },
        };

        const formatDecimal = formatNumber(args);
        expect(formatDecimal).toEqual('98,765.12');
    });

    test('should format a string-number to locale specific numeric-decimal (with plus)', () => {
        const args = {
            value: '98765.12+',
            options: {
                style: 'decimal',
            },
        };

        const formatDecimal = formatNumber(args);
        expect(formatDecimal).toEqual('98,765.12+');
    });

    test('should format a decimal-number to locale specific numeric-percent', () => {
        const args = {
            value: '0.45',
            options: {
                style: 'percent',
            },
        };

        const formatPercent1 = formatNumber(args);
        expect(formatPercent1).toEqual('45%');
    });

    test('should format a decimal-number to locale specific numeric-percent (with plus)', () => {
        const args = {
            value: '0.45+',
            options: {
                style: 'percent',
            },
        };

        const formatPercent1 = formatNumber(args);
        expect(formatPercent1).toEqual('45%+');
    });

    test('should format a string-number to locale specific numeric-percent', () => {
        const args = {
            value: '12345',
            options: {
                style: 'percent',
            },
        };

        const formatPercent2 = formatNumber(args);
        expect(formatPercent2).toEqual('12,345%');
    });

    test('should format a string-number to locale specific numeric-percent (with plus)', () => {
        const args = {
            value: '12345+',
            options: {
                style: 'percent',
            },
        };

        const formatPercent2 = formatNumber(args);
        expect(formatPercent2).toEqual('12,345%+');
    });
});
