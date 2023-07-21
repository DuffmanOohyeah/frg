import gql from 'graphql-tag';
import { wrapQuery } from './util';
import { BlogCategory } from './getBlogCategoryList';

export interface GetContentPageQueryData {
    getContentPage?: {
        bodyHtml: string;
        title: string;
        author: string;
        categories: BlogCategory[];
        excerptHtml: string;
        publishedGmt: string;
        modifiedGmt: string;
        slug: string;
    };
}

export interface GetContentPageQueryParams {
    path: string;
    urlOverride?: string;
}

export const GetContentPageQuery = gql`
    query getContentPage($path: String!, $urlOverride: String) {
        getContentPage(path: $path, urlOverride: $urlOverride) {
            bodyHtml
            title
            author
            categories {
                name
                slug
                id
            }
            excerptHtml
            publishedGmt
            modifiedGmt
            slug
        }
    }
`;

export const getContentPage = wrapQuery<GetContentPageQueryParams, GetContentPageQueryData>(GetContentPageQuery);
