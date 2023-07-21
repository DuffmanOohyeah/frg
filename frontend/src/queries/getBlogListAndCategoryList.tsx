import gql from 'graphql-tag';
import { wrapQuery } from './util';
import { GetBlogListQueryData, GetBlogListQueryParams } from './getBlogList';
import { GetBlogCategoryListQueryData, GetBlogCategoryListQueryParams } from './getBlogCategoryList';

export interface GetBlogListAndCategoryListQueryData extends GetBlogListQueryData, GetBlogCategoryListQueryData {}

export interface GetBlogListAndCategoryListQueryParams extends GetBlogListQueryParams, GetBlogCategoryListQueryParams {}

export const GetBlogListAndCategoryListQuery = gql`
    query getBlogListAndCategoryList($page: Int, $urlOverride: String, $category: String) {
        getBlogCategoryList {
            name
            slug
            id
            count
        }
        getBlogList(page: $page, urlOverride: $urlOverride, category: $category) {
            pageList {
                slug
                title
                excerptHtml
                file
            }
            pageTotals {
                postTotal
                postPages
            }
        }
    }
`;

export const getBlogListAndCategoryList = wrapQuery<
    GetBlogListAndCategoryListQueryParams,
    GetBlogListAndCategoryListQueryData
>(GetBlogListAndCategoryListQuery);
