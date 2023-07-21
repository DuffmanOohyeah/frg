import { Client } from '../client';
import { DocumentNode } from 'graphql';
import { FetchPolicy } from 'apollo-client';
import { useQuery, useLazyQuery, QueryHookOptions, LazyQueryHookOptions, QueryTuple } from '@apollo/react-hooks';
import { QueryResult } from '@apollo/react-common';

export interface QueryOptions {
    fetchPolicy?: FetchPolicy;
}

const globalDefaultOptions = {
    fetchPolicy: 'network-only' as FetchPolicy,
};

interface WrappedQuery<P, D> {
    (type: QueryType.Promise): (client: Client, params: P, options?: QueryOptions | undefined) => Promise<D>;
    (type: QueryType.Hook): (params: P, options?: QueryHookOptions<D, P> | undefined) => QueryResult<D, P>;
    (type: QueryType.Lazyhook): (options?: LazyQueryHookOptions<D, P> | undefined) => QueryTuple<D, P>;
}
export enum QueryType {
    Promise = 'promise',
    Hook = 'hook',
    Lazyhook = 'lazyHook',
}

export const wrapQuery = <P, D>(query: DocumentNode, defaultOptions: QueryOptions = {}): WrappedQuery<P, D> => {
    function queryPicker(type: QueryType.Promise): (client: Client, params: P, options?: QueryOptions) => Promise<D>;
    function queryPicker(type: QueryType.Hook): (params: P, options?: QueryHookOptions<D, P>) => QueryResult<D, P>;
    function queryPicker(type: QueryType.Lazyhook): (options?: LazyQueryHookOptions<D, P>) => QueryTuple<D, P>;
    function queryPicker(
        type: QueryType,
    ):
        | ((client: Client, params: P, options: QueryOptions) => Promise<D>)
        | ((params: P, options: QueryHookOptions<D, P>) => QueryResult<D, P>)
        | ((options: LazyQueryHookOptions<D, P>) => QueryTuple<D, P>) {
        if (type === QueryType.Promise)
            return async (client: Client, params: P, options: QueryOptions = {}): Promise<D> => {
                return client
                    .query({
                        ...globalDefaultOptions,
                        ...defaultOptions,
                        ...options,
                        query: query,
                        variables: params,
                    })
                    .then(response => {
                        return response.data as D;
                    });
            };
        if (type === QueryType.Hook)
            return (params: P, options: QueryHookOptions<D, P> = {}): QueryResult<D, P> => {
                return useQuery(query, {
                    ...globalDefaultOptions,
                    ...defaultOptions,
                    ...options,
                    variables: params,
                });
            };
        if (type === QueryType.Lazyhook)
            return (options: LazyQueryHookOptions<D, P> = {}): QueryTuple<D, P> => {
                return useLazyQuery(query, {
                    ...globalDefaultOptions,
                    ...defaultOptions,
                    ...options,
                });
            };
        else throw 'Invalid query type';
    }
    return queryPicker;
};
