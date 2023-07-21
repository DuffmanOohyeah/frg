import { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import i18nNextAs from './i18nNextAs';
import i18nNextHref from './i18nNextHref';
import { useRef } from 'react';
import { UrlObject } from 'url';
import { isBrowser } from '../client';

declare type Url = UrlObject | string;
declare type PushFunction = (href: Url, as: Url, options: Record<string, unknown>) => Promise<boolean>;

const useI18nRouter = (): NextRouter => {
    const router = useRouter();
    const patchedPush = useRef<PushFunction | null>(null);
    const patchedReplace = useRef<PushFunction | null>(null);

    // We want to keep the rest of the api the same and just replace the stuff we care about
    // so that we can do any locale prefixing if necessary
    if (!patchedPush.current) {
        const originalPush = router.push;
        const push: PushFunction = async (href, as, options) => {
            const correctedHref = i18nNextHref(href);
            const correctedAs = i18nNextAs(as, href);
            const pushResult = await originalPush(correctedHref, correctedAs, options);
            if (isBrowser()) {
                window.scrollTo(0, 0);
            }
            return pushResult;
        };
        patchedPush.current = push;
    }

    // We want to keep the rest of the api the same and just replace the stuff we care about
    // so that we can do any locale prefixing if necessary
    if (!patchedReplace.current) {
        const originalReplace = router.replace;
        const replace: PushFunction = (href, as, options) => {
            const correctedHref = i18nNextHref(href);
            const correctedAs = i18nNextAs(as, href);
            return originalReplace(correctedHref, correctedAs, options);
        };
        patchedReplace.current = replace;
    }
    return { ...router, push: patchedPush.current, replace: patchedReplace.current };
};

export default useI18nRouter;
