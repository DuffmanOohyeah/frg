import React, { ReactElement, useContext, useEffect } from 'react';
import { getClient, getConfigServer } from '../client';
import { NextPage } from 'next';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import {
    searchCandidates,
    SearchCandidatesData,
    SearchCandidatesQuery,
    defaultSearchCandidatesQuery,
    SearchCandidatesQueryFrontend,
} from '../queries';
import SearchResultsCandidates from '../components/templates/CandidateSearch/SearchResultsCandidates';
import {
    getSingleQueryParam,
    getOptionalMultiQueryParam,
    getSingleIntegerQueryParam,
    getOptionalBoolQueryParam,
} from '../pagesUtil';
import { JobType } from '../types';
import SearchResultsTemplateCandidate from '../components/templates/CandidateSearch/SearchResultsTemplateCandidate';
import frgI18n from '../i18n/frgI18n';
import CatchAllErrorPage from '../components/templates/Errors/CatchAllError';
import valueToEnum from '../utils/valueToEnum';
import { QueryType } from '../queries/util';
import cleanSearchFormQuery from '../utils/cleanSearchFormQuery';
import postCandidateSearchFormHandler from '../pardot/formHandlers/candidateSearchFilters';
import UserContext from '../components/utils/WithAuth/UserContext';
import Heading from '../components/bits/Headings/Headings';
import { join, omit, map, any, equals, cond, always, T, slice } from 'ramda';
import { twoWeeksAgo } from '../utils/twoWeeksAgo';
import postEmptyCandidateSearchResultsFormHandler from '../pardot/formHandlers/emptyCandidateSearchResults';
import objectToUrlQuery from '../utils/objectToUrlQuery';
import CandidateSearchEmailButton from '../components/bits/CandidateSearchEmailButton/CandidateSearchEmailButton';
import { SavedCandidateSearch } from '../queries/employer/getSavedCandidateSearches';
import { stringify } from 'querystring';
import OverrideBodyBgColor from '../components/utils/OverrideBodyBgColor/OverrideBodyBgColor';
import { BrandContext } from '../components/utils/WithBrand';

const NoResults = styled.div`
    border-bottom: rgba(100, 112, 120, 0.18) solid 1px;
    margin-bottom: 20px;
`;

const searchHasEmailAlert = (savedCandidateSearches: SavedCandidateSearch[], currentSearch): boolean => {
    const replaceNullParamsWithUndefined = (savedCandidateSearches: SavedCandidateSearch[]): SavedCandidateSearch[] =>
        map<SavedCandidateSearch, SavedCandidateSearch>(savedCandidates => {
            return {
                ...savedCandidates,
                params: map<SearchCandidatesQuery, SearchCandidatesQuery>(
                    searchParam => (searchParam === null ? undefined : searchParam),
                    omit(['__typename'], savedCandidates.params),
                ),
            };
        }, savedCandidateSearches);
    const searchParamsWithoutNull = replaceNullParamsWithUndefined(savedCandidateSearches);
    const removePageFromCurrentSearch = omit<SearchCandidatesQuery, 'page'>(['page'], currentSearch);

    return any((search: SavedCandidateSearch) => {
        if (!search.emailAlert) return false;
        return equals(removePageFromCurrentSearch)(search.params);
    })(searchParamsWithoutNull);
};

interface BrandAttributeProps {
    bodyBgColor?: string;
}

const getBrandAttributes = (brand: string) =>
    cond<string, BrandAttributeProps>([
        [equals('Washington'), always({ bodyBgColor: 'white' })],
        [T, always({})],
    ])(brand);

export interface CandidatesSearchProps {
    data: SearchCandidatesData;
    query: SearchCandidatesQueryFrontend;
}

const CandidatesSearch: NextPage<CandidatesSearchProps> = (props: CandidatesSearchProps): ReactElement => {
    const { t } = useTranslation();
    const { user, employerUserDetails, candidateUserDetails, savedCandidateSearches } = useContext(UserContext);
    const data = props.data.searchCandidates;
    const candidateSearchFacets = props.data.getCandidateSearchFacets;
    const query = props.query;
    const currentQuery = {
        ...defaultSearchCandidatesQuery,
        ...query,
    };
    const router = frgI18n.useRouter();

    let page = query.page || 1;

    let isLoggedIn = false;
    if (candidateUserDetails || employerUserDetails) isLoggedIn = true;

    if (!isLoggedIn) {
        // NGW-2291: limit the array, pagination, page, etc...
        data.items = slice(0, 5, data.items);
        data.pagination.value = 1;
        page = 1;
    }

    const handleClickSearchCandidates = (query: SearchCandidatesQuery): void => {
        router.push({
            pathname: '/candidate-search',
            query: cleanSearchFormQuery(query),
        });
    };

    const searchSavedPreviously = searchHasEmailAlert(savedCandidateSearches || [], currentQuery);

    useEffect(() => {
        if (user && user.attributes) {
            // If this page is loaded serverside then this fires before setPardotEndpointValues in _app.ts
            // has finished which means we have no endpoints. The IDEAL solution for this is to make a custom hook
            // that can fire when the endpoints are set up but for now I shall use an icky timer.
            const userEmail = user.attributes.email;
            const sendSearchToPardot = (): Promise<boolean> => {
                return postCandidateSearchFormHandler({
                    /* eslint-disable @typescript-eslint/naming-convention */
                    email: userEmail,
                    filter_jobtitle: join(', ', query.jobTitles || []),
                    location: query.location,
                    filter_keywords: query.keyword,
                    job_type: query.jobType,
                    skill: join(', ', query.skills || []),
                    /* eslint-enable @typescript-eslint/naming-convention */
                });
            };
            setTimeout(sendSearchToPardot, 1000);
        }

        if (!data.items.length) {
            const searchQuery = omit(['page'], currentQuery);
            // If this page is loaded serverside then this fires before setPardotEndpointValues in _app.ts
            // has finished which means we have no endpoints. The IDEAL solution for this is to make a custom hook
            // that can fire when the endpoints are set up but for now I shall use an icky timer.
            const sendEmptySearchToPardot = (): Promise<boolean> =>
                postEmptyCandidateSearchResultsFormHandler({
                    /* eslint-disable @typescript-eslint/naming-convention */
                    email:
                        employerUserDetails?.email ||
                        candidateUserDetails?.email ||
                        'emptysearchresults@frankgroup.com',
                    no_results: objectToUrlQuery(searchQuery),
                    /* eslint-enable @typescript-eslint/naming-convention */
                });
            setTimeout(sendEmptySearchToPardot, 1000);
        }
    }, [data]);

    if (data) {
        const { value: totalResults } = data.pagination;
        const maxResultsPerPage = 10;
        let numberOfPages = Math.ceil(totalResults / maxResultsPerPage) || 1;
        if (!isLoggedIn) numberOfPages = 1;

        const notOnValidPage = page > numberOfPages || page < 1;

        if (notOnValidPage) {
            router.push({
                pathname: '/candidate-search',
                query: { ...query, page: 1 },
            });
        }

        const { brand } = useContext(BrandContext);
        const attributes = getBrandAttributes(brand);

        return (
            <>
                {attributes.bodyBgColor ? <OverrideBodyBgColor bgColor={attributes.bodyBgColor} /> : null}
                <SearchResultsTemplateCandidate
                    title={t('search_candidate_title')}
                    results={totalResults}
                    currentQuery={currentQuery}
                    facets={{
                        jobTitles: candidateSearchFacets.jobTitles,
                        levels: candidateSearchFacets.levels,
                        skills: candidateSearchFacets.skills,
                    }}
                    newFacet={candidateSearchFacets.newCandidates}
                    pagination={{
                        prev: page > 1,
                        next: page < numberOfPages,
                        pages: numberOfPages,
                        handleClickPage: (data): void => {
                            const selectedPage = data.selected + 1;
                            const page = selectedPage > 1 ? Number(selectedPage) : undefined;
                            const pageNumberQuery = { ...query, page };
                            router.push({
                                pathname: '/candidate-search',
                                query: pageNumberQuery,
                            });
                        },
                        forcePage: page - 1,
                        hrefBuilder: (page: number): string => {
                            const pageNumberQuery = { ...query, page };
                            const params = stringify(pageNumberQuery);
                            return `/candidate-search?${params}`;
                        },
                    }}
                    onSearch={handleClickSearchCandidates}
                    searchButtonLabel={t('search_candidate_submitLabel')}
                >
                    <>
                        {!!data.items.length && <SearchResultsCandidates data={data.items} />}
                        {!data.items.length && (
                            <div>
                                <NoResults>
                                    <Heading as="h1" size="gamma">
                                        {t('search_candidate_noResultsTitle')}
                                    </Heading>
                                    {employerUserDetails && (
                                        <p>
                                            {searchSavedPreviously &&
                                                t('search_candidate_loggedIn_noResultsDescription_hasSaveEmailAlert')}
                                            {!searchSavedPreviously && (
                                                <Trans
                                                    i18nKey="search_candidate_loggedIn_noResultsDescription"
                                                    components={{
                                                        emailAlerts: (
                                                            <CandidateSearchEmailButton
                                                                employerUserDetails={employerUserDetails}
                                                                currentQuery={currentQuery}
                                                            />
                                                        ),
                                                    }}
                                                />
                                            )}
                                        </p>
                                    )}
                                </NoResults>

                                <div>
                                    <Heading as="h2" size="gamma">
                                        {t('search_candidate_requestShortlistTitle')}
                                    </Heading>
                                    <p>{t('search_candidate_requestShortlistDescription')}</p>
                                </div>
                            </div>
                        )}
                        {!isLoggedIn ? (
                            <>
                                <br />
                                {t('search_candidate_profilesLocked')}
                            </>
                        ) : null}
                    </>
                </SearchResultsTemplateCandidate>
            </>
        );
    }
    return <CatchAllErrorPage />;
};

CandidatesSearch.getInitialProps = async (ctx): Promise<CandidatesSearchProps> => {
    const config = await getConfigServer();
    const client = getClient(config);

    const jobTypeUnchecked = getSingleQueryParam(ctx.query, 'jobType', '');
    const jobType = valueToEnum<typeof JobType>(JobType, jobTypeUnchecked) || JobType.Both;

    const query = {
        keyword: getSingleQueryParam(ctx.query, 'keyword', ''),
        location: getSingleQueryParam(ctx.query, 'location', ''),
        jobType,
        skills: getOptionalMultiQueryParam(ctx.query, 'skills'),
        jobTitles: getOptionalMultiQueryParam(ctx.query, 'jobTitles'),
        levels: getOptionalMultiQueryParam(ctx.query, 'levels'),
        addedSince: getOptionalBoolQueryParam(ctx.query, 'newCandidates') ? twoWeeksAgo : undefined,
        page: getSingleIntegerQueryParam(ctx.query, 'page', 1),
    };

    const data = await searchCandidates(QueryType.Promise)(client, query);
    // set the status code for the error page
    // that is displayed if there is no candidates
    if (!data?.searchCandidates && ctx.res) {
        ctx.res.statusCode = 404;
    }
    const frontendQuery = omit(['addedSince'], {
        ...query,
        newCandidates: query.addedSince ? true : undefined,
    });
    return {
        data,
        query: frontendQuery,
    };
};

export default CandidatesSearch;
