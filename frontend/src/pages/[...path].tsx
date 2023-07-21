import { NextPage } from 'next';
import { reduce, replace, startsWith, values } from 'ramda';
import React, { useContext } from 'react';
import getJobSearchUrl from '../brands/getJobSearchUrl';
import getSeoVanityUrls from '../brands/getSeoVanityUrls';
import { checkIsGeneratedCandidateSearchPrefix } from '../brands/getVanityUrls/getCandidateVanityUrls';
import { getCandidateOtherUrls } from '../brands/getVanityUrls/getCandidateVanityUrls';
import { generatedJobSearchPrefixs } from '../brands/getVanityUrls/getJobVanityUrls';
import { VanityUrl, VanityUrls } from '../brands/getVanityUrls/VanityUrls';
import { getConfigServer } from '../client';
import JobSearchPage from '../components/pages/JobSearchPage';
import CatchAllErrorPage from '../components/templates/Errors/CatchAllError';
import { BrandContext, BrowseJobsPageVariants } from '../components/utils/WithBrand';
import frgI18n from '../i18n/frgI18n';
import cleanSearchFormQuery from '../utils/cleanSearchFormQuery';
import findGeneratedJobSearchUrl from '../utils/findGeneratedJobSearchUrl';
import { getCandidateVanityUrls, getJobVanityUrls, getJobVanityVariantUrls } from '../utils/getBrandSpecficData';
import { redirectIfFixedPageRedirect } from '../utils/getFixedPageRedirects';
import getGeneratedCandidateSearchQuery from '../utils/getGeneratedCandidateSearchQuery';
import getGeneratedJobSearchQuery from '../utils/generatedJobSearch/getGeneratedJobSearchQuery';
import CandidateSearchPage from './candidate-search';
import BlogPage from './insights/[slug]';

const formatJobVanityVariantUrls = (jobVanityVariantUrls: Record<BrowseJobsPageVariants, VanityUrls> | undefined) =>
    reduce<VanityUrls, Record<string, VanityUrl>>(
        (acc, vanityUrls) => ({ ...acc, ...vanityUrls }),
        {},
        values(jobVanityVariantUrls || {}),
    );

/*****************************************************************************/
/* Use this page to catch all "non standard defined" pages                   */
/* This is especially used for vanity urls as they differ per brand          */
/* and we don't want to pollute the 'pages' folder with loads of vanity urls */
/*****************************************************************************/

// TODO FIX THE SAD TYPINGS IN THIS FILE

// This is "any" atm as it can be the props of any page that we want to "redirect to"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CatchallPage: NextPage = (props: any) => {
    const brand = props.config?.brand;
    const router = frgI18n.useRouter();
    const {
        brandData: { candidateVanityUrls, jobVanityUrls, jobVanityVariantUrls },
    } = useContext(BrandContext);
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

    // Load Job Search Page
    const jobSearchVanityUrl = path && jobVanityUrls[path];
    const formatedJobVanityVariantUrls = formatJobVanityVariantUrls(jobVanityVariantUrls);
    const jobVanityVariantUrl = path && formatedJobVanityVariantUrls[path];
    const generatedJobSearchVanityUrl = generatedJobSearchPrefixs(brand).find(findGeneratedJobSearchUrl(path));
    const jobIdUrl = Boolean(path && path.match(/\/([0-9])\w+/g)?.length);
    const isBrandSearchPage = getJobSearchUrl(brand) === path;
    if (jobSearchVanityUrl || jobVanityVariantUrl || generatedJobSearchVanityUrl || jobIdUrl || isBrandSearchPage) {
        return <JobSearchPage {...props} />;
    }

    // Load Candidate Search Page

    const candidateSearchOtherUrls = getCandidateOtherUrls(brand);
    const candidateSearchVanityUrl = path && candidateVanityUrls[path];
    const candidateSearchOtherUrl = path && candidateSearchOtherUrls[path];
    const generatedCandidateSearchVanityUrl = checkIsGeneratedCandidateSearchPrefix(path, brand);
    if (candidateSearchVanityUrl || generatedCandidateSearchVanityUrl || candidateSearchOtherUrl) {
        return <CandidateSearchPage {...props} />;
    }

    //  generic error component
    return <CatchAllErrorPage />;
};

// This is "any" atm as it can be the props of any page that we want to "redirect to"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
CatchallPage.getInitialProps = async (ctx): Promise<any> => {
    const { brand } = await getConfigServer();

    const rawAsPath = ctx.asPath || '';
    const languagePrefix = ctx.query.lang;
    const pathWithoutLanguagePrefix = startsWith(`/${languagePrefix}/`, rawAsPath)
        ? replace(`/${languagePrefix}`, '', rawAsPath)
        : rawAsPath;
    const path = pathWithoutLanguagePrefix.split('?')[0] || '';
    const pathQuery = ctx.query;

    redirectIfFixedPageRedirect(brand, rawAsPath, ctx.res);

    // TODO make this hacky way of makeing pages work nicer
    const page = Number(Array.isArray(ctx.query.page) ? '1' : ctx.query.page);

    // SEO blog page
    const seoVanityUrls = getSeoVanityUrls(brand);
    const seoVanityUrl = path && seoVanityUrls[path];
    if (seoVanityUrl) {
        if (BlogPage.getInitialProps) {
            return BlogPage.getInitialProps({ ...ctx, query: { slug: seoVanityUrl, ...ctx.query } });
        }
    }

    // Job Search Vanity Url Redirects
    const jobSearchVanityUrls = await getJobVanityUrls(brand);
    const jobSearchVanityUrl = path && jobSearchVanityUrls[path];
    const jobVanityVariantUrls = await getJobVanityVariantUrls(brand);
    const formatedJobVanityVariantUrls = formatJobVanityVariantUrls(jobVanityVariantUrls);
    const jobVanityVariantUrl = path && formatedJobVanityVariantUrls[path];
    const generatedJobSearchVanityUrl = generatedJobSearchPrefixs(brand).find(findGeneratedJobSearchUrl(path || ''));
    const jobIdUrl = Boolean(path && path.match(/\/([0-9])\w+/g)?.length);
    const isBrandSearchPage = getJobSearchUrl(brand) === path;

    if (jobSearchVanityUrl || generatedJobSearchVanityUrl || jobIdUrl || isBrandSearchPage) {
        if (isBrandSearchPage) {
            const cleanQuery = cleanSearchFormQuery({ ...pathQuery, page });
            return JobSearchPage.getInitialProps?.({ ...ctx, query: cleanQuery });
        }
        if (jobSearchVanityUrl) {
            const cleanQuery = cleanSearchFormQuery({ ...jobSearchVanityUrl.query, page });
            return JobSearchPage.getInitialProps?.({ ...ctx, query: cleanQuery });
        }
        if (jobVanityVariantUrl) {
            const cleanQuery = cleanSearchFormQuery({ ...jobVanityVariantUrl.query, page });
            return JobSearchPage.getInitialProps?.({ ...ctx, query: cleanQuery });
        }
        // This unfortunately sometimes matches on `isBrandSearchPage` so needs to come after that check
        if (generatedJobSearchVanityUrl) {
            const cleanQuery = cleanSearchFormQuery({ ...getGeneratedJobSearchQuery(brand, path), page });
            return JobSearchPage.getInitialProps?.({ ...ctx, query: cleanQuery });
        }
        return JobSearchPage.getInitialProps?.({ ...ctx });
    }

    // Candidate Search Vanity Url Redirects
    const candidateSearchVanityUrls = await getCandidateVanityUrls(brand);
    const candidateSearchOtherUrls = getCandidateOtherUrls(brand);
    const candidateSearchVanityUrl = path && candidateSearchVanityUrls[path];
    const candidateSearchOtherUrl = path && candidateSearchOtherUrls[path];
    const generatedCandidateSearchUrl = checkIsGeneratedCandidateSearchPrefix(path, brand);
    if (candidateSearchVanityUrl || generatedCandidateSearchUrl || candidateSearchOtherUrl) {
        if (candidateSearchVanityUrl) {
            const cleanQuery = cleanSearchFormQuery({ ...candidateSearchVanityUrl.query, page });
            return CandidateSearchPage.getInitialProps?.({ ...ctx, query: cleanQuery });
        }
        if (candidateSearchOtherUrl) {
            const cleanQuery = cleanSearchFormQuery({ ...candidateSearchOtherUrl.query, page });
            return CandidateSearchPage.getInitialProps?.({ ...ctx, query: cleanQuery });
        }
        if (generatedCandidateSearchUrl) {
            const cleanQuery = cleanSearchFormQuery({ ...getGeneratedCandidateSearchQuery(brand, path), page });
            return CandidateSearchPage?.getInitialProps?.({ ...ctx, query: cleanQuery });
        }
    }

    ctx.res && (ctx.res.statusCode = 404);

    return {};
};

export default CatchallPage;
