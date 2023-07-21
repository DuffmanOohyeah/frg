/*
  Borrowed alot of this from:
  https://github.com/isaachinman/next-i18next/blob/f8a555ec5901a0a71a01b0aedc7eca2c4c7be054/src/components/Link.tsx
  as it's still in beta so I'm just going to use the bits we need (can't get beta to deploy atm)
*/

import { UrlObject } from 'url';
import i18next from 'i18next';
import { formatWithValidation } from 'next/dist/shared/lib/utils';
import frgI18n from './frgI18n';
import { DEFAULT_LANG } from '../brands/getAdditionalLanguages';

const i18nNextAs = (originalAs, originalHref: string | UrlObject): string => {
    const asType = typeof originalAs;
    let as;

    if (asType === 'undefined') {
        if (typeof originalHref === 'string') {
            as = originalHref;
        } else {
            as = formatWithValidation(originalHref);
        }
    } else if (asType === 'string') {
        as = originalAs;
    } else if (asType === 'object') {
        as = formatWithValidation(originalAs);
    } else {
        throw new Error(`'as' type must be 'string' or 'object', but is ${asType}`);
    }

    // If we are switching locales then the 'as' value might contain the
    // previous locale subpath so we should remove it
    frgI18n.languages.forEach((subpath: string) => {
        if (subpath) {
            if (as.startsWith(`/${subpath}/`)) {
                // Don't remove the slash at the end of the match
                as = as.replace(`/${subpath}`, '');
            } else if (as.endsWith(`/${subpath}`)) {
                as = as.replace(`/${subpath}`, '');
            }
        }
    });

    if (i18next.language && i18next.language !== DEFAULT_LANG) {
        as = `/${i18next.language}${as}`.replace(/\/$/, '');
    }

    // If 'as' is empty that means that we were originally coming from the prefixed root url
    // and now we're going to default language root so add back a single slash
    if (!as) {
        as = '/';
    }

    return as;
};

export default i18nNextAs;
