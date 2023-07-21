import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface BlogCategory {
    name: string;
    slug: string;
    id: number;
    count: number;
}

export type BlogCategoryList = Array<BlogCategory>;

export interface GetBlogCategoryListQueryData {
    getBlogCategoryList: BlogCategoryList;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetBlogCategoryListQueryParams {}

export const GetBlogCategoryListQuery = gql`
    query getBlogCategoryList {
        getBlogCategoryList {
            name
            slug
            id
            count
        }
    }
`;

export const getBlogCategoryList = wrapQuery<GetBlogCategoryListQueryParams, GetBlogCategoryListQueryData>(
    GetBlogCategoryListQuery,
);
