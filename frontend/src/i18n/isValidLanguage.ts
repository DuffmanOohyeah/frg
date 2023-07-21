import { contains } from 'ramda';
import { getAdditionalLanguages } from '../brands';
import { DEFAULT_LANG } from '../brands/getAdditionalLanguages';

export const isValidLanguage = (brand: string, lang = DEFAULT_LANG): boolean => {
    const additionalLanguages = getAdditionalLanguages(brand);
    const brandLanguages = [DEFAULT_LANG, ...additionalLanguages];
    return contains(lang, brandLanguages);
};
