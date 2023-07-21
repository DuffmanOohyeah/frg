import gql from 'graphql-tag';
import { wrapQuery } from './util';

type GetSitemapBlogListParams = Record<string, never>;

interface GetSitemapBlogListData {
    getSitemapBlogList: {
        slug: string;
        modifiedGmt: string;
    }[];
}

const GetSitemapBlogListQuery = gql`
    query getSitemapBlogList {
        getSitemapBlogList {
            slug
            modifiedGmt
        }
    }
`;

export const GetSitemapBlogList = wrapQuery<GetSitemapBlogListParams, GetSitemapBlogListData>(GetSitemapBlogListQuery);
