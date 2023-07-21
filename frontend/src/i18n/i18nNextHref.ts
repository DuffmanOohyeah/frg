/*
  Borrowed alot of this from:
  https://github.com/isaachinman/next-i18next/blob/f8a555ec5901a0a71a01b0aedc7eca2c4c7be054/src/components/Link.tsx
  as it's still in beta so I'm just going to use the bits we need (can't get beta to deploy atm)
*/

import { parse, UrlObject } from 'url';
import i18next from 'i18next';
import { DEFAULT_LANG } from '../brands/getAdditionalLanguages';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const i18nNextHref = (originalHref: any): string | UrlObject => {
    const hrefType = typeof originalHref;
    let href;

    if (hrefType === 'string') {
        href = parse(originalHref, true);
    } else if (hrefType === 'object') {
        href = { ...originalHref };
        href.query = originalHref.query ? { ...originalHref.query } : {};
    } else {
        throw new Error(`'href' type must be either 'string' or 'object', but it is ${hrefType}`);
    }

    if (i18next.language !== DEFAULT_LANG) {
        href.query = {
            ...href.query,
            // Next JS rewrites will handle actually displaying the right language prefix if we just this through
            lang: i18next.language,
        };
        delete href.search;
    }

    return href;
};

export default i18nNextHref;
