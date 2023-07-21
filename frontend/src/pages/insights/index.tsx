import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import { getClient, getConfigServer } from '../../client';
import BlogListPage, { BlogListProps } from '../../components/built/BlogListPage';
import { getBlogListAndCategoryList } from '../../queries';
import { includeConfig, getSingleIntegerQueryParam } from '../../pagesUtil';
import { QueryType } from '../../queries/util';

const BlogIndex: NextPage<BlogListProps> = (props: BlogListProps): ReactElement => {
    return <BlogListPage {...props} />;
};

BlogIndex.getInitialProps = async (ctx): Promise<BlogListProps> => {
    const config = await getConfigServer();
    const client = getClient(config);

    const pageNumber = getSingleIntegerQueryParam(ctx.query, 'page', 1);

    return getBlogListAndCategoryList(QueryType.Promise)(client, {
        page: pageNumber,
        urlOverride: config.contentDomain,
    })
        .then(data => ({
            initialData: {
                categories: {
                    getBlogCategoryList: data.getBlogCategoryList,
                },
                posts: {
                    getBlogList: data.getBlogList,
                },
            },
            query: {
                page: pageNumber,
            },
        }))
        .then(includeConfig(config));
};

export default BlogIndex;
