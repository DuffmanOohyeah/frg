import { getConfigServer } from '../../client';
import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import { getSingleQueryParam } from '../../pagesUtil';
import JobErrorPage from '../../components/templates/Errors/JobError';
import getOldJobUrlMapping from '../../brands/getOldJobUrlMapping';
import { redirectIfFixedPageRedirect } from '../../utils/getFixedPageRedirects';
import getSeoVanityUrls from '../../brands/getSeoVanityUrls';
import { replace, startsWith } from 'ramda';
import frgI18n from '../../i18n/frgI18n';
import BlogPage from '../insights/[slug]';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ViewJobPage: NextPage = (props: any): ReactElement => {
    const brand = props?.config?.brand;
    const router = frgI18n.useRouter();
    const rawAsPath = router.asPath || '';
    const languagePrefix = router.query.lang;
    const pathWithoutLanguagePrefix = startsWith(`/${languagePrefix}/`, rawAsPath)
        ? replace(`/${languagePrefix}`, '', rawAsPath)
        : rawAsPath;
    const path = pathWithoutLanguagePrefix.split('?')[0];

    // SEO blog page
    const seoVanityUrls = getSeoVanityUrls(brand);
    const seoVanityUrl = path && seoVanityUrls[path];
    if (seoVanityUrl) {
        return <BlogPage {...props} />;
    }
    return <JobErrorPage />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
ViewJobPage.getInitialProps = async (ctx): Promise<any> => {
    const config = await getConfigServer();
    const brand = config.brand;
    const rawAsPath = ctx.asPath || '';

    redirectIfFixedPageRedirect(brand, rawAsPath, ctx.res);

    const languagePrefix = ctx.query.lang;
    const pathWithoutLanguagePrefix = startsWith(`/${languagePrefix}/`, rawAsPath)
        ? replace(`/${languagePrefix}`, '', rawAsPath)
        : rawAsPath;
    const path = pathWithoutLanguagePrefix.split('?')[0] || '';

    // SEO blog page
    const seoVanityUrls = getSeoVanityUrls(brand);
    const seoVanityUrl = path && seoVanityUrls[path];
    if (seoVanityUrl) {
        if (BlogPage.getInitialProps) {
            return BlogPage.getInitialProps({ ...ctx, query: { slug: seoVanityUrl, ...ctx.query } });
        }
    }

    const jobUrlMap = await getOldJobUrlMapping(brand);
    const oldJobRef = getSingleQueryParam(ctx.query, 'oldJobRef');
    const oldJobSlug = getSingleQueryParam(ctx.query, 'oldJobSlug');
    const newJobRef = jobUrlMap[`/${oldJobRef}/${oldJobSlug}`];
    if (newJobRef && ctx.res) {
        ctx.res.writeHead(301, {
            location: `/job/${encodeURIComponent(newJobRef)}`,
        });
        ctx.res.end();
    }
    // set the status code for the error page
    // that is displayed if there is no job
    if (ctx.res) {
        ctx.res.statusCode = 404;
    }
    return null;
};

export default ViewJobPage;
