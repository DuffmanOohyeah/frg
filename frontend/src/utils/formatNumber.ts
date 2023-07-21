// W3 documentation: https://www.w3schools.com/jsref/jsref_tolocalestring_number.asp
const parseLocale = (language?: string): string => {
    // primarily for home page numbers, etc.
    let siteLanguage = 'en'; // set default language translation
    let rtnLocale = siteLanguage + '-GB'; // set default return locale
    if (language) siteLanguage = language.toLowerCase().trim();
    /* eslint-disable indent */
    switch (siteLanguage) {
        case 'de':
        case 'fr':
        case 'it':
        case 'pl':
        case 'nl':
        case 'es':
            rtnLocale = siteLanguage + '-' + siteLanguage.toUpperCase();
            break;
    }
    /* eslint-enable indent */
    return rtnLocale;
};

export interface FormatNumberProps {
    value: string | number;
    options?: {
        currency?: string;
        currencyDisplay?: string;
        style?: string;
    };
    language?: string;
}

const formatNumber = (args: FormatNumberProps): string => {
    let rtnString: string = args.value.toString();
    const locale: string = parseLocale(args.language);
    const localeOptions = {
        currency: args.options?.currency || 'EUR', // EUR, USD, INR, etc.
        currencyDisplay: args.options?.currencyDisplay || 'symbol', // symbol, code, name
        style: args.options?.style || 'decimal', // currency, decimal, percent
        localeMatcher: 'lookup', // best-fit, lookup
        minimumSignificantDigits: 1, // A number from 1 to 21 (default is 21)
    };

    const digitPattern = /\D/g;
    // next line: if Number() not used, toLocaleString() will try to parse date
    const digitsOnly = Number(rtnString.replace(digitPattern, '')); // get digits only

    /* eslint-disable indent */
    switch (localeOptions.style) {
        case 'currency':
            rtnString = digitsOnly.toLocaleString(locale, localeOptions);
            break;

        case 'percent':
            let fraction = digitsOnly;
            if (!isNaN(fraction)) {
                if (fraction.toString().indexOf('.') < 0) fraction = fraction / 100;
                rtnString = fraction.toLocaleString(locale, localeOptions);
            }
            break;

        default:
            // decimal
            let num = 0;
            if (rtnString.indexOf('.') > 0) num = parseFloat(rtnString);
            else num = digitsOnly;
            rtnString = num.toLocaleString(locale, localeOptions);
            break;
    }
    /* eslint-enable indent */

    const plusPattern = /\+/g;
    const hasPlus: boolean = plusPattern.test(args.value.toString());
    if (hasPlus) rtnString += '+';

    return rtnString;
};

export default formatNumber;
