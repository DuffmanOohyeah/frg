import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface BlogListItem {
    slug: string;
    title: string;
    excerptHtml: string;
    file: string;
}

export interface BlogPageTotals {
    postTotal: number;
    postPages: number;
}

export type BlogListItemList = Array<BlogListItem>;

export interface BlogList {
    pageList: BlogListItemList;
    pageTotals: BlogPageTotals;
}

export interface GetBlogListQueryData {
    getBlogList: BlogList;
}

export interface GetBlogListQueryParams {
    page: number;
    urlOverride?: string;
    category?: string;
}

export const GetBlogListQuery = gql`
    query getBlogList($page: Int, $urlOverride: String, $category: String) {
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

export const getBlogList = wrapQuery<GetBlogListQueryParams, GetBlogListQueryData>(GetBlogListQuery);
