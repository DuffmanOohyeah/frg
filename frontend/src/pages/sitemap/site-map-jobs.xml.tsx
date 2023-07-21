import { NextPage } from 'next';
import { getClient, getConfigServer } from '../../client';
import { QueryType } from '../../queries/util';
import { getAllJobsForSitemap } from '../../queries/getAllJobsForSitemap';
import { flatten, isEmpty, map } from 'ramda';
import { makeSitemapUrlEntryFromPath, makeSitemapXml } from './site-map.xml';
import { getAdditionalLanguages } from '../../brands';
import formatJobTitleForUrl from '../../utils/formatJobTitleForUrl';

// We never hit this in the client and we should never be rendering on
// the serverside since we do a response.write
const JobsSitemapPage: NextPage = () => {
    return null;
};

const mapAdditionalLanguages = (
    additionalLanguages,
    jobVanitySitemapUrlAndRef,
): { url: string; lastModified: string }[][] =>
    map(
        lang =>
            map(
                jobVanitySitemapUrlAndRef => ({
                    url: `/${lang}${jobVanitySitemapUrlAndRef.url}`,
                    lastModified: jobVanitySitemapUrlAndRef.lastModified,
                }),
                jobVanitySitemapUrlAndRef,
            ),
        additionalLanguages,
    );

JobsSitemapPage.getInitialProps = async (ctx): Promise<void> => {
    const config = await getConfigServer();
    const { brand } = config;
    const client = getClient(config);

    if (ctx.req && ctx.res) {
        const request = ctx.req;
        const response = ctx.res;
        const host = request.headers.host || '';
        const additionalLanguages = getAdditionalLanguages(brand);
        const allJobsForSitemap = await getAllJobsForSitemap(QueryType.Promise)(client, {});

        const jobVanitySitemapUrlAndRef = map(
            allJobsForSitemap => ({
                url: `/job/${encodeURIComponent(allJobsForSitemap.reference)}/${formatJobTitleForUrl(
                    allJobsForSitemap.title,
                )}`,
                lastModified: allJobsForSitemap.lastModified,
            }),
            allJobsForSitemap.getAllJobsForSitemap,
        );

        const additionalLanguagJobVanitySitemapUrlAndRef = flatten(
            isEmpty(additionalLanguages) ? [] : mapAdditionalLanguages(additionalLanguages, jobVanitySitemapUrlAndRef),
        );
        const JobVanitySitemapEntries = map(
            languageAllJobsForSitemap =>
                makeSitemapUrlEntryFromPath(
                    host,
                    languageAllJobsForSitemap.url,
                    'daily',
                    languageAllJobsForSitemap.lastModified,
                ),
            [...jobVanitySitemapUrlAndRef, ...additionalLanguagJobVanitySitemapUrlAndRef],
        );
        response.setHeader('Content-Type', 'text/xml');
        response.write(makeSitemapXml([...JobVanitySitemapEntries]));
        response.end();
    }
    return undefined;
};

export default JobsSitemapPage;
