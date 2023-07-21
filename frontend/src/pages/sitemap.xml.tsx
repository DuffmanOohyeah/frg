import { NextPage } from 'next';
import { join, map } from 'ramda';

const staticPagesToAddToSitemapLinks = ['/sitemap/site-map.xml', '/sitemap/site-map-jobs.xml'];

export const makeSitemapUrlEntryFromPath = (host: string, path: string): string => `<sitemap>
<loc>https://${host}${path}</loc>
  </sitemap>`;

export const makeSitemapXml = (paths: string[]): string =>
    join('\n', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...paths,
        '</sitemapindex>',
    ]);

// We never hit this in the client and we should never be rendering on
// the serverside since we do a response.write
const SitemapPage: NextPage = () => {
    return null;
};

SitemapPage.getInitialProps = async (ctx): Promise<void> => {
    if (ctx.req && ctx.res) {
        const request = ctx.req;
        const response = ctx.res;
        const host = request.headers.host || '';

        // Main "static" pages
        const mainPagesSitemapEntries = map(
            path => makeSitemapUrlEntryFromPath(host, path),
            staticPagesToAddToSitemapLinks,
        );

        response.setHeader('Content-Type', 'text/xml');
        response.write(makeSitemapXml(mainPagesSitemapEntries));
        response.end();
    }
    return undefined;
};

export default SitemapPage;
