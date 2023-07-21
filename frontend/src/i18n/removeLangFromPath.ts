import { getAdditionalLanguages } from '../brands';

const removeLangFromPath = (path: string, brand: string): string => {
    const lang = getAdditionalLanguages(brand).find(lang => path.startsWith(`/${lang}/`) || path === `/${lang}`);
    return path.replace(`/${lang}`, '');
};

export default removeLangFromPath;
