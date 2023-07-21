import { mapObjIndexed } from 'ramda';
import { SearchFormQuery } from '../components/patterns/SearchForm/SearchForm';
import { ParsedUrlQuery } from 'querystring';
import { SearchCandidatesQuery } from '../queries';

const cleanSearchFormQuery = (query: Partial<SearchFormQuery> | Partial<SearchCandidatesQuery>): ParsedUrlQuery =>
    mapObjIndexed<string | string[] | number | boolean, string | string[]>(
        val => (typeof val === 'number' || typeof val === 'boolean' ? val.toString() : val),
        query,
    );

export default cleanSearchFormQuery;
