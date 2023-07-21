import { NextRouter } from 'next/router';
import { replace, startsWith } from 'ramda';

const pathWithoutLanguageAndQuery = (router: NextRouter) => {
    const rawAsPath = router.asPath || '';
    const languagePrefix = router.query.lang;
    const pathWithoutLanguagePrefix = startsWith(`/${languagePrefix}/`, rawAsPath)
        ? replace(`/${languagePrefix}`, '', rawAsPath)
        : rawAsPath;
    return pathWithoutLanguagePrefix.split('?')[0];
};

export default pathWithoutLanguageAndQuery;
