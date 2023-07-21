import WPBlogHelper from '../../components/bits/WPBlogHelper/WPBlogHelper';
import StyledContainer from '../../components/utils/Container/Container';
import { getConfigServer, getClient, Config, isBrowser } from '../../client';
import React, { ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { getContentPage, GetContentPageQueryData } from '../../queries';
import { getSingleQueryParam } from '../../pagesUtil';
import { DiscussionEmbed } from 'disqus-react';
import { equals, cond, always } from 'ramda';
import Heading from '../../components/bits/Headings/Headings';
import CenteredSpinner from '../../components/bits/Spinner/CenteredSpinner';
import I18nLink from '../../i18n/I18nLink';
import styled from 'styled-components';
import Breadcrumbs from '../../components/bits/Breadcrumbs/Breadcrumbs';
import { QueryType } from '../../queries/util';
import SocialShareButtons from '../../components/bits/SocialShareButtons/SocialShareButtons';
import BlogSubscribeBanner from '../../components/patterns/BlogSubscribeBanner/BlogSubscribeBanner';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';
import { removeSrcset } from '../../utils/removeSrcset';
import { addOnclickToDropdown, cleanUpOnClicks } from '../../utils/wpDropdownUtils';
import wpUrlReplacer from '../../utils/wpUrlReplacer';
import { BrandContext } from '../../components/utils/WithBrand';
import { redirectIfFixedPageRedirect } from '../../utils/getFixedPageRedirects';

export interface BlogPageProps {
    config: Config;
    page: GetContentPageQueryData;
    slug: string;
    fullUrl: string;
}

// If falsy then don't use disqus embed.
// See https://frankgroup.atlassian.net/browse/NGW-1035 for scenario where
// some brands have the embed and others do not
const discusBrandSelector = cond<string, string>([
    [equals('Anderson'), always('')],
    [equals('Mason'), always('')],
    [equals('Nelson'), always('')],
    [equals('Nigel'), always('')],
    [equals('Jefferson'), always('jefferson-frank')],
    [equals('Washington'), always('')],
    [equals('FrgTech'), always('')],
]);

const BlogHeader = styled.div`
    margin-bottom: 24px;
`;

const BlogPage: NextPage<BlogPageProps> = (props: BlogPageProps): ReactElement => {
    const { page, fullUrl } = props;
    const [loading, setLoading] = useState(false);
    const blogContentPage = useRef<HTMLDivElement>(null);
    const { brand } = useContext(BrandContext);
    const currentUrl = isBrowser() ? window.location.href : fullUrl;

    // adds a onclick to a dropdown in the html. This functionality is lost in our scraping.
    // The visobility of the second child of a "spoiler" is determined by whetther it has
    // the class su-spoiler-closed or not this code adds handlers to the first child of
    // "spoiler" which add and remove this class
    useEffect(() => {
        const spoilerTitles = addOnclickToDropdown(blogContentPage);
        if (spoilerTitles.length) return (): void => cleanUpOnClicks(spoilerTitles);
    }, []);

    if (page && page.getContentPage) {
        const html = wpUrlReplacer(page.getContentPage.bodyHtml, brand);
        return (
            <StyledContainer size="maxWidth" marginTop>
                <Breadcrumbs>
                    <li>
                        <I18nLink href="/insights" passHref>
                            <a onClick={(): void => setLoading(true)}>Blog</a>
                        </I18nLink>
                    </li>
                    {page.getContentPage.categories && !!page.getContentPage.categories.length && (
                        <li>
                            <I18nLink
                                href={{
                                    pathname: '/insights/category/[categorySlug]',
                                    query: {
                                        categorySlug: page.getContentPage.categories[0].slug,
                                    },
                                }}
                                as={`/insights/category/${page.getContentPage.categories[0].slug}`}
                                passHref
                            >
                                <a onClick={(): void => setLoading(true)}>{page.getContentPage.categories[0].name}</a>
                            </I18nLink>
                        </li>
                    )}
                </Breadcrumbs>

                {loading && <CenteredSpinner />}
                {!loading && (
                    <StyledContainer size="medium">
                        <WPBlogHelper ref={blogContentPage}>
                            {/* here is where the retrieved HTML is put into the page */}
                            <BlogHeader>
                                <Heading
                                    as="h1"
                                    size="beta"
                                    dangerouslySetInnerHTML={{ __html: page.getContentPage.title }}
                                />
                                <Heading
                                    as="p"
                                    size="gamma"
                                    dangerouslySetInnerHTML={{ __html: `By ${page.getContentPage.author}` }}
                                />
                            </BlogHeader>
                            <SocialShareButtons title={page.getContentPage.title} url={currentUrl} />
                            <div
                                data-testid={props['data-testid']}
                                dangerouslySetInnerHTML={{
                                    __html: removeSrcset(html),
                                }}
                            />
                        </WPBlogHelper>
                        {discusBrandSelector(props.config.brand) && (
                            <DiscussionEmbed
                                shortname={discusBrandSelector(props.config.brand)}
                                config={{
                                    url: isBrowser() ? window.location.href : '',
                                    //TODO get disqus identifers?
                                    identifier: '',
                                    title: page.getContentPage.title,
                                }}
                            />
                        )}
                    </StyledContainer>
                )}
                <BlogSubscribeBanner />
            </StyledContainer>
        );
    }

    return <CatchAllErrorPage />;
};

BlogPage.getInitialProps = async (ctx: NextPageContext): Promise<BlogPageProps> => {
    const config = await getConfigServer();
    const slug = getSingleQueryParam(ctx.query, 'slug');
    const client = getClient(config);
    const fullUrl = 'https://' + ctx.req?.headers.host + ctx.req?.url;
    const rawAsPath = ctx.asPath || '';

    redirectIfFixedPageRedirect(config.brand, rawAsPath, ctx.res);

    const page = await getContentPage(QueryType.Promise)(client, {
        path: slug,
        urlOverride: config.contentDomain,
    });
    // set the status code for the error page
    // that is displayed if there is no blog post
    if (!page?.getContentPage && ctx.res) {
        ctx.res.statusCode = 404;
    }
    return { page, slug, fullUrl, config };
};

export default BlogPage;
