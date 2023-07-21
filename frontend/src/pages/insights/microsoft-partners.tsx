import BlogPage, { BlogPageProps } from './[slug]';
import React from 'react';
import { NextPageContext } from 'next';
import { getClient, getConfigServer } from '../../client';
import { includeConfig } from '../../pagesUtil';
import { redirectIfFixedPageRedirect } from '../../utils/getFixedPageRedirects';
import { getContentPage } from '../../queries';
import { QueryType } from '../../queries/util';

const MicrosoftPartnersPage = config => <BlogPage {...config} />;

MicrosoftPartnersPage.getInitialProps = async (ctx: NextPageContext): Promise<BlogPageProps> => {
    const config = await getConfigServer();
    const slug = 'microsoft-partners';
    const client = getClient(config);
    const fullUrl = 'https://' + ctx.req?.headers.host + '/employers/microsoft-partners';
    const rawAsPath = ctx.asPath || '';

    redirectIfFixedPageRedirect(config.brand, rawAsPath, ctx.res);

    return getContentPage(QueryType.Promise)(client, {
        path: slug,
        urlOverride: config.contentDomain,
    })
        .then(page => ({ page, slug, fullUrl }))
        .then(includeConfig(config));
};

export default MicrosoftPartnersPage;
