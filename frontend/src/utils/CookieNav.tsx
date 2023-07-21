import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import frgI18n from '../i18n/frgI18n';

const CookieNav = () => {
    const [cookies, , removeCookie] = useCookies(['autoNav']);
    const router = frgI18n.useRouter();

    useEffect(() => {
        // only navigate when on the english home page since this is where the sso provider
        // returns us to. If we are anywhere else we havent navigated to sso yet
        if (cookies.autoNav && router.pathname === '/' && !router.query.lang) {
            if (typeof cookies.autoNav === 'object') {
                removeCookie('autoNav', { path: '/' });
                router.push(
                    { pathname: cookies.autoNav.pathname, query: cookies.autoNav.query },
                    cookies.autoNav.pathname,
                );
            }
            if (typeof cookies.autoNav === 'string') {
                removeCookie('autoNav', { path: '/' });
                router.push(cookies.autoNav);
            }
        }
    }, [cookies]);
    return null;
};
export default CookieNav;
