import React, { ReactElement } from 'react';
import { getConfigServer, getClient } from '../../../client';
import { NextPage } from 'next';
import BlogListPage, { BlogListProps } from '../../../components/built/BlogListPage';
import { getBlogListAndCategoryList } from '../../../queries';
import { includeConfig, getSingleQueryParam, getSingleIntegerQueryParam } from '../../../pagesUtil';
import { QueryType } from '../../../queries/util';

const BlogListByCategory: NextPage<BlogListProps> = (props: BlogListProps): ReactElement => {
    return <BlogListPage {...props} />;
};

BlogListByCategory.getInitialProps = async (ctx): Promise<BlogListProps> => {
    const config = await getConfigServer();
    const client = getClient(config);

    const pageNumber = getSingleIntegerQueryParam(ctx.query, 'page', 1);
    const categorySlug = getSingleQueryParam(ctx.query, 'categorySlug');

    return getBlogListAndCategoryList(QueryType.Promise)(client, {
        page: pageNumber,
        urlOverride: config.contentDomain,
        category: categorySlug,
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
                categorySlug: categorySlug,
            },
        }))
        .then(includeConfig(config));
};

export default BlogListByCategory;
