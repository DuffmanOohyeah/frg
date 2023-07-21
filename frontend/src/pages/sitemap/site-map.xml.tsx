import moment from 'moment';
import { NextPage } from 'next';
import { always, cond, equals, flatten, isEmpty, join, map, T } from 'ramda';
import { getAdditionalLanguages } from '../../brands';
import getJobSearchUrl from '../../brands/getJobSearchUrl';
import getCandidateSitemapLandingPages from '../../brands/getSitemapLandingPages/candidates';
import getJobSitemapLandingPages from '../../brands/getSitemapLandingPages/jobs';
import { getClient, getConfigServer } from '../../client';
import { GetSitemapBlogList } from '../../queries/getSitemapBlogList';
import { QueryType } from '../../queries/util';

const commonStaticPagesToAddToSitemap = [
    '',
    '/about',
    '/browse-candidates',
    '/browse-jobs',
    '/candidate-search',
    '/contact',
    '/employers',
    '/insights',
    '/jobs-by-email',
    '/job-seekers',
    '/referral-scheme',
    '/register',
    '/terms-of-business',
    '/saved-jobs',
    '/submit-your-job',
];

const getBrandSpecificStaticPages = cond<string, string[]>([
    [
        equals('Nigel'),
        always([
            '/browse-business-applications-jobs',
            '/browse-intelligent-cloud-jobs',
            '/browse-modern-workplace-jobs',
        ]),
    ],
    [
        equals('FrgTech'),
        always([
            '/insights/category/ask-the-developer',
            '/insights/category/career-advice',
            '/insights/category/events',
            '/insights/category/hiring-advice',
            '/insights/category/java-news',
            '/insights/category/marketing-automation-implementation',
            '/insights/category/mobile-news',
            '/insights/category/news',
            '/insights/category/product-tips-and-tricks',
            '/insights/category/product-updates',
        ]),
    ],
    [T, always([])],
]);

const convertLastmodToUTCTime = (lastmod?: string): string | undefined => lastmod && moment(lastmod).toISOString();

export const makeSitemapUrlEntryFromPath = (
    host: string,
    path: string,
    changeFrequency = 'monthly',
    lastmod?: string,
): string => `<url>
    <changefreq>${changeFrequency}</changefreq>
    ${lastmod ? `<lastmod>${convertLastmodToUTCTime(lastmod)}</lastmod>` : ''}
    <loc>https://${host}${path}</loc>
</url>`;

export const makeSitemapXml = (paths: string[]): string =>
    join('\n', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...paths,
        '</urlset>',
    ]);

// We never hit this in the client and we should never be rendering on
// the serverside since we do a response.write
const SitemapPage: NextPage = () => {
    return null;
};

SitemapPage.getInitialProps = async (ctx): Promise<void> => {
    const config = await getConfigServer();
    const { brand } = config;
    const client = getClient(config);

    if (ctx.req && ctx.res) {
        const request = ctx.req;
        const response = ctx.res;
        const host = request.headers.host || '';
        const additionalLanguages = getAdditionalLanguages(brand);

        const brandStaticPagesToAddToSitemap = [getJobSearchUrl(brand), ...getBrandSpecificStaticPages(brand)];
        const staticPagesToAddToSitemap = [...commonStaticPagesToAddToSitemap, ...brandStaticPagesToAddToSitemap];

        // Main "static" pages
        const languageMainPagesUrls = isEmpty(additionalLanguages)
            ? []
            : flatten(map(lang => map(url => `/${lang}${url}`, staticPagesToAddToSitemap), additionalLanguages));
        const mainPagesSitemapEntries = map(path => makeSitemapUrlEntryFromPath(host, path), [
            ...staticPagesToAddToSitemap,
            ...languageMainPagesUrls,
        ]);

        // Job related urls
        const jobVanityUrls = getJobSitemapLandingPages(brand);
        const languageJobVanityUrls = flatten(
            isEmpty(additionalLanguages)
                ? []
                : map(lang => map(url => `/${lang}${url}`, jobVanityUrls), additionalLanguages),
        );
        const jobVanitySitemapEntries = map(vanityUrl => makeSitemapUrlEntryFromPath(host, vanityUrl, 'daily'), [
            ...jobVanityUrls,
            ...languageJobVanityUrls,
        ]);

        // Candidate related urls
        const candidateVanityUrls = getCandidateSitemapLandingPages(brand);
        const languageCandidateVanityUrls = flatten(
            isEmpty(additionalLanguages)
                ? []
                : map(lang => map(url => `/${lang}${url}`, candidateVanityUrls), additionalLanguages),
        );
        const candidateVanitySitemapEntries = map(vanityUrl => makeSitemapUrlEntryFromPath(host, vanityUrl, 'daily'), [
            ...candidateVanityUrls,
            ...languageCandidateVanityUrls,
        ]);

        // Blog related urls
        const blogPosts = await GetSitemapBlogList(QueryType.Promise)(client, {});
        const blogVanitySitemapEntries = flatten(
            map(
                blogDetails => [
                    makeSitemapUrlEntryFromPath(
                        host,
                        `/insights/${blogDetails.slug}`,
                        'monthly',
                        blogDetails.modifiedGmt,
                    ),
                    // Make the other language urls
                    ...map(
                        lang =>
                            makeSitemapUrlEntryFromPath(
                                host,
                                `/${lang}/insights/${blogDetails.slug}`,
                                'monthly',
                                blogDetails.modifiedGmt,
                            ),
                        additionalLanguages,
                    ),
                ],
                blogPosts.getSitemapBlogList,
            ),
        );

        response.setHeader('Content-Type', 'text/xml');
        response.write(
            makeSitemapXml([
                ...mainPagesSitemapEntries,
                ...jobVanitySitemapEntries,
                ...candidateVanitySitemapEntries,
                ...blogVanitySitemapEntries,
            ]),
        );
        response.end();
    }
    return undefined;
};

export default SitemapPage;
