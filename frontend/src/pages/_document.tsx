import { ServerStyleSheet } from 'styled-components';
import Document, { DocumentInitialProps, DocumentContext, Html, Head, Main } from 'next/document';
import { RenderPageResult } from 'next/dist/shared/lib/utils';
import React, { ReactElement } from 'react';
import GoogleTagManagerScript from '../components/bits/GoogleTagManagerScript/GoogleTagManagerScript';
import GoogleTagManagerNoScript from '../components/bits/GoogleTagManagerNoScript/GoogleTagManagerNoScript';
import { getConfigServer } from '../client';
import NextScriptCustom from '../nextScriptCustom';
import getCurrentLanguage from '../components/utils/getCurrentLanguage';

interface DocumentProps extends DocumentInitialProps {
    googleTagManagerCode?: string;
}

export default class FRGDocument extends Document<DocumentProps> {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentProps> {
        const config = await getConfigServer();
        const { googleTagManagerCode } = config;
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = (): RenderPageResult | Promise<RenderPageResult> =>
                originalRenderPage({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    enhanceApp: App => (props): React.ReactElement => sheet.collectStyles(<App {...props} />),
                });

            const initialProps = await Document.getInitialProps(ctx);
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                ),
                googleTagManagerCode,
            };
        } finally {
            sheet.seal();
        }
    }

    render(): ReactElement {
        const { googleTagManagerCode } = this.props;
        return (
            <Html lang={getCurrentLanguage(this.props)}>
                <Head>
                    <GoogleTagManagerScript googleTagManagerCode={googleTagManagerCode} />
                </Head>
                <body>
                    <GoogleTagManagerNoScript googleTagManagerCode={googleTagManagerCode} />
                    <Main />
                    <NextScriptCustom />
                </body>
            </Html>
        );
    }
}
