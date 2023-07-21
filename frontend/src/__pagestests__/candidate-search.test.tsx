import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import CandidatesSearch from '../pages/candidate-search';
import theme, { NelsonThemeLogos } from '../themes/Nelson';
import { getClient, getConfigServer, Config } from '../client';
import { assertIsDefined, MockQueryClient, mockConfig } from './testUtils';
import { SearchCandidates } from '../queries';
import { MockedProvider } from '@apollo/react-testing';
import { JobType } from '../types';

jest.mock('../client');

describe('pages/candidate-search', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'scrollTo', {
            value: () => {
                // do nothing
            },
            writable: true,
        });
    });

    test('should render the page with the fetched data', async () => {
        const initialData = {
            searchCandidates: {
                items: [
                    {
                        id: 'id',
                        indexedAt: 'indexedAt',
                        lastModified: new Date().toISOString(),
                        salary: {
                            currency: 'EUR',
                            normalised: 100,
                            amount: 100,
                            description: 'salary.description',
                        },
                        recruiter: {
                            phone: 'recruiter.phone',
                            name: 'recruiter.name',
                            email: 'recruiter.email',
                        },
                        location: { description: 'location.description' },
                        willingToWorkRemotely: true,
                        willingToRelocate: true,
                        type: 'type',
                        skills: [
                            {
                                yearsExperience: 0,
                                score: 0,
                                name: 'skills.name',
                            },
                        ],
                        profile: 'profile',
                        product: ['product'],
                        normalisedJobTitle: 'normalisedJobTitle',
                        level: 'level',
                        language: ['language'],
                        jobTitle: 'jobTitle',
                        industryExperience: ['industryExperience'],
                        advertId: 'advertId',
                        education: 'education',
                        currentStatus: 'currentStatus',
                        advertTitle: 'advertTitle',
                        accreditations: ['accreditations'],
                    },
                ],
                pagination: {
                    value: 1,
                    relation: 'relation',
                },
            },
            getCandidateSearchFacets: {
                skills: [
                    {
                        key: 'key',
                        docCount: 1,
                    },
                ],
                jobTitles: [
                    {
                        key: 'key',
                        docCount: 1,
                    },
                ],
                levels: [
                    {
                        key: 'key',
                        docCount: 1,
                    },
                ],
                newCandidates: [
                    {
                        key: 'key',
                        docCount: 1,
                        value: '',
                    },
                ],
            },
        };

        const query = {
            keyword: 'keyword',
            location: 'location',
            jobType: JobType.Permanent,
            page: 1,
            skills: [],
            jobTitles: [],
            levels: [],
        };

        const { getAllByText } = render(
            <ThemeProvider theme={{ ...theme, ...NelsonThemeLogos }}>
                <MockedProvider>
                    <CandidatesSearch data={initialData} query={query} />
                </MockedProvider>
            </ThemeProvider>,
        );
        const heroHeading = await getAllByText('search_candidate_title:');
        expect(heroHeading.length).toEqual(1);
    });
});

describe('pages/candidate-search getInitialProps', () => {
    beforeEach(() => {
        (getConfigServer as jest.Mock<Promise<Config>>).mockImplementation(
            (): Promise<Config> => Promise.resolve(mockConfig),
        );
    });

    test('getInitialProps should return the right props', async () => {
        const mockQuery = jest.fn().mockImplementation(() =>
            Promise.resolve({
                data: {
                    searchCandidates: {
                        items: [
                            {
                                id: 'id',
                                indexedAt: 'indexedAt',
                                lastModified: 'lastModified',
                                salary: {
                                    currency: 'EUR',
                                    normalised: 100,
                                    amount: 100,
                                    description: 'salary.description',
                                },
                                recruiter: {
                                    phone: 'recruiter.phone',
                                    name: 'recruiter.name',
                                    email: 'recruiter.email',
                                },
                                location: { description: 'location.description' },
                                willingToWorkRemotely: true,
                                willingToRelocate: true,
                                type: 'type',
                                skills: [
                                    {
                                        yearsExperience: 0,
                                        score: 0,
                                        name: 'skills.name',
                                    },
                                ],
                                profile: 'profile',
                                product: ['product'],
                                normalisedJobTitle: 'normalisedJobTitle',
                                level: 'level',
                                language: ['language'],
                                jobTitle: 'jobTitle',
                                industryExperience: ['industryExperience'],
                                advertId: 'advertId',
                                education: 'education',
                                currentStatus: 'currentStatus',
                                advertTitle: 'advertTitle',
                                accreditations: ['accreditations'],
                            },
                        ],
                        pagination: {
                            totalItems: 11,
                            page: 1,
                            totalPages: 2,
                        },
                    },
                },
            }),
        );

        ((getClient as unknown) as jest.Mock<MockQueryClient>).mockImplementation(
            (): MockQueryClient => ({
                query: mockQuery,
            }),
        );

        assertIsDefined(CandidatesSearch.getInitialProps);

        const initialProps = await CandidatesSearch.getInitialProps({
            pathname: '/pages/insights',
            query: {
                jobType: 'permanent',
            },
            AppTree: jest.fn(),
        });
        expect(initialProps).toEqual({
            data: {
                searchCandidates: {
                    items: [
                        {
                            id: 'id',
                            indexedAt: 'indexedAt',
                            lastModified: 'lastModified',
                            salary: {
                                currency: 'EUR',
                                normalised: 100,
                                amount: 100,
                                description: 'salary.description',
                            },
                            recruiter: {
                                phone: 'recruiter.phone',
                                name: 'recruiter.name',
                                email: 'recruiter.email',
                            },
                            location: { description: 'location.description' },
                            willingToWorkRemotely: true,
                            willingToRelocate: true,
                            type: 'type',
                            skills: [
                                {
                                    yearsExperience: 0,
                                    score: 0,
                                    name: 'skills.name',
                                },
                            ],
                            profile: 'profile',
                            product: ['product'],
                            normalisedJobTitle: 'normalisedJobTitle',
                            level: 'level',
                            language: ['language'],
                            jobTitle: 'jobTitle',
                            industryExperience: ['industryExperience'],
                            advertId: 'advertId',
                            education: 'education',
                            currentStatus: 'currentStatus',
                            advertTitle: 'advertTitle',
                            accreditations: ['accreditations'],
                        },
                    ],
                    pagination: {
                        totalItems: 11,
                        page: 1,
                        totalPages: 2,
                    },
                },
            },
            query: {
                keyword: '',
                location: '',
                jobType: 'permanent',
                skills: [],
                levels: [],
                jobTitles: [],
                page: 1,
            },
        });

        expect(mockQuery).toHaveBeenCalledWith({
            query: SearchCandidates,
            fetchPolicy: 'network-only',
            variables: {
                keyword: '',
                location: '',
                jobType: 'permanent',
                skills: [],
                levels: [],
                jobTitles: [],
                page: 1,
            },
        });
    });
});
