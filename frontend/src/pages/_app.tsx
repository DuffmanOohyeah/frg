require('isomorphic-fetch');
import { withSSRContext } from 'aws-amplify';
import App, { AppInitialProps, NextWebVitalsMetric } from 'next/app';
import Head from 'next/head';
import React, { ReactElement } from 'react';
import { CookiesProvider } from 'react-cookie';
import { ThemeProvider } from 'styled-components';
import { getHeadTitle, getTypekit } from '../brands';
import getCanonical from '../brands/getCanonical';
import getFacebookVerification from '../brands/getFacebookVerification';
import getGoogleVerificationMeta from '../brands/getGoogleVerificationMeta';
import getHrefLang from '../brands/getHrefLang';
import getHtmlMeta from '../brands/getHtmlMeta';
import getOgImageMetaTag from '../brands/getOgImage';
import getTwitterMeta from '../brands/getTwitterMeta';
import getThemeLogos from '../brands/getThemeLogos';
import { browserPersistConfig, getConfigServer, isBrowser } from '../client';
import OneTrust from '../components/bits/OneTrust/OneTrust';
import EmailVerificationBanner from '../components/patterns/EmailVerificationBanner/EmailVerificationBanner';
import Footer from '../components/patterns/Footer/Footer';
import Header from '../components/patterns/Header/Header';
import IncompleteRegistrationBanner from '../components/patterns/IncompleteRegistrationBanner';
import JsCloudCode from '../components/patterns/JsCloudCode';
import LiveChat from '../components/patterns/LiveChat';
import WithLoginModal from '../components/patterns/LoginModal/WithLoginModal';
import WithLoginRegisterPrompt from '../components/patterns/LoginRegisterPrompt/WithLoginRegisterPrompt';
import PardotTrackingCode from '../components/patterns/PardotTrackingCode';
import SeoFooter from '../components/patterns/SeoFooter/SeoFooter';
import CatchAllErrorPage from '../components/templates/Errors/CatchAllError';
import BodyWrapper from '../components/utils/BodyWrapper/BodyWrapper';
import WithApollo from '../components/utils/WithApollo/WithApollo';
import WithAuth from '../components/utils/WithAuth/WithAuth';
import WithUser from '../components/utils/WithAuth/WithUser';
import { BrandProvider } from '../components/utils/WithBrand';
import { WithConfigForPardotAssign } from '../components/utils/WithPardotAssign';
import frgI18n from '../i18n/frgI18n';
import { isValidLanguage } from '../i18n/isValidLanguage';
import removeLangFromPath from '../i18n/removeLangFromPath';
import { setDevPardotEndpointValues, setPardotEndpointValues } from '../pardot/makePardotFetch';
import { ResetCSS } from '../styles';
import favicon from '../themes/favicons';
import { Theme } from '../themes/theme';
import configureAmplify from '../utils/configureAmplify';
import CookieNav from '../utils/CookieNav';
import getBrandSpecficData from '../utils/getBrandSpecficData';

interface NoopWrapperProps {
    children: React.ReactNode;
}
const NoopWrapper = (props: NoopWrapperProps): React.ReactElement => <>{props.children}</>;

export const reportWebVitals = ({ id, name, value, label }: NextWebVitalsMetric): void => {
    window?.gtag?.('event', name, {
        eventCategory: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        eventLabel: id,
        nonInteraction: true,
    });
};

// Reports page view changes that occur when moving between pages.
// The initial refresh page load is caught by the default behaviour
const reportPageView = (path: string): void => {
    window?.gtag?.('event', 'page-view', {
        /* eslint-disable @typescript-eslint/naming-convention */
        page_title: path,
        page_path: path,
        /* eslint-enable @typescript-eslint/naming-convention */
    });
};

class FRGApp extends App {
    // Runs on the server side every time
    // Runs on the client side only when navigating with Nextjs (so normally on load of every page after the first one)
    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/explicit-module-boundary-types
    static async getInitialProps({ Component, ctx }): Promise<AppInitialProps> {
        const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};
        const config = await getConfigServer();

        // initialise i81n here because it is an asynchronous thing and we need
        // it to be loaded before the server attempts to render the page!
        const t = await frgI18n.init(config.brand, ctx.query.lang, undefined, true);
        const brandData = await getBrandSpecficData(config.brand, t);
        const isValidLang = isValidLanguage(config.brand, ctx.query.lang);
        // set the status code for the error page
        // that is displayed if the language is invalid for this brand
        if (!isValidLang) {
            ctx.res.statusCode = 404;
        }
        if (!isBrowser()) {
            configureAmplify(config);
            const Auth = withSSRContext({ req: ctx.req }).Auth;
            try {
                const user = await Auth.currentAuthenticatedUser();
                return {
                    pageProps: {
                        ...pageProps,
                        config,
                        user,
                        i18nResourceData: frgI18n.i18nResourceData,
                        brandData,
                    },
                };
            } catch (Err) {
                // catch error but dont throw as this just means the user is logged out
            }
        }
        return {
            pageProps: {
                ...pageProps,
                config,
                i18nResourceData: frgI18n.i18nResourceData,
                brandData,
            },
        };
    }

    render(): ReactElement {
        const { Component, pageProps, router } = this.props;
        const { config, user, i18nResourceData, brandData } = pageProps;
        const ApolloWrapper = isBrowser() ? WithApollo : NoopWrapper;
        const ConfigForPardotAssignWrapper = isBrowser() ? WithConfigForPardotAssign : NoopWrapper;

        const lang = Array.isArray(router.query.lang) ? router.query.lang[0] : router.query.lang;
        // This has to live here so it can run client side when we actually first load the page
        // into the browser.
        if (isBrowser()) {
            reportPageView(router.route);
            browserPersistConfig(config);
            // initialise i81n here because it is an asynchronous thing and we need
            // it to be loaded clientside before the user moves to another page

            frgI18n.init(config.brand, lang, i18nResourceData);
            if (config.useProdPardotEndpoints) {
                setPardotEndpointValues(config.brand);
            } else {
                setDevPardotEndpointValues(config.brand);
            }
        }

        const isValidLang = isValidLanguage(config.brand, lang);
        const pathWithoutLang = isValidLang
            ? removeLangFromPath(router.asPath, config.brand).split('?')[0]
            : router.asPath.split('?')[0];
        // Remove language prefix from path to avoid job searches being caught in /[...path] in getHtmlMeta
        const metaMap = getHtmlMeta(config.brand);
        const Meta = metaMap[pathWithoutLang] || metaMap[router.pathname];
        // the logos are not JSON able so they cant be passed through getInitialProps
        // so they are split apart from the rest of the theme and rejoined here
        const theme: Theme = { ...brandData.theme, ...getThemeLogos(config.brand) };
        return (
            <BrandProvider value={{ brand: config.brand, brandData }}>
                <ThemeProvider theme={theme}>
                    <CookiesProvider>
                        <CookieNav />
                        <ResetCSS />
                        <WithUser config={config} user={user}>
                            <ApolloWrapper config={config}>
                                <WithAuth config={config}>
                                    <ConfigForPardotAssignWrapper config={config}>
                                        <Head>
                                            <title>{getHeadTitle(config.brand)}</title>
                                            <link rel="shortcut icon" href={favicon(config.brand)} />
                                            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                                            {getTypekit(config.brand)}
                                            {getFacebookVerification(config.brand)}
                                            {getHrefLang(config.brand, router.asPath, lang)}
                                            {getCanonical(config.brand, router.asPath)}
                                            {getOgImageMetaTag(config)}
                                            {getTwitterMeta(config)}
                                            {getGoogleVerificationMeta(config.brand)}
                                        </Head>
                                        {Meta && <Meta brand={config.brand} router={router} {...pageProps} />}
                                        <BodyWrapper>
                                            <WithLoginModal config={config}>
                                                <WithLoginRegisterPrompt>
                                                    <Header />
                                                    <EmailVerificationBanner />
                                                    <IncompleteRegistrationBanner />
                                                    {isValidLang ? (
                                                        <Component {...pageProps} url={router} />
                                                    ) : (
                                                        <CatchAllErrorPage />
                                                    )}
                                                    <SeoFooter brand={config.brand} />
                                                    <Footer brand={config.brand} />
                                                </WithLoginRegisterPrompt>
                                            </WithLoginModal>
                                        </BodyWrapper>
                                        <LiveChat />
                                        <OneTrust {...config} />
                                        <PardotTrackingCode config={config} />
                                        <JsCloudCode />
                                    </ConfigForPardotAssignWrapper>
                                </WithAuth>
                            </ApolloWrapper>
                        </WithUser>
                    </CookiesProvider>
                </ThemeProvider>
            </BrandProvider>
        );
    }
}

export default FRGApp;
