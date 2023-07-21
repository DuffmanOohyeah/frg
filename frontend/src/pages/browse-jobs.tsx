import React, { useContext } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Container from '../components/utils/Container/Container';
import PageHeader from '../components/bits/PageHeader/PageHeader';
import SearchLinksCard, { SearchLinkProps } from '../components/patterns/SearchLinksCard/SearchLinksCard';
import { pipe, values, keys, map, groupBy, reduce, cond, equals, always, T } from 'ramda';
import { VanityUrl, VanityUrls } from '../brands/getVanityUrls/VanityUrls';
import { BrandContext, BrowseJobsPageVariants } from '../components/utils/WithBrand';
import { TFunction } from 'i18next';
import NigelCollapsibleNav from '../components/patterns/CollapsibleNav/nigel';
import OverrideBodyBgColor from '../components/utils/OverrideBodyBgColor/OverrideBodyBgColor';

interface SearchLinkObjectProps {
    title?: string;
    links: SearchLinkProps[];
}

interface BrowseJobsPageProps {
    variant?: BrowseJobsPageVariants;
}

const BrowseJobCards = styled.div`
    margin-top: 36px;

    > * + * {
        margin-top: 24px;
    }
`;

const CollapsibleNavContainer = styled(Container)`
    background: white;
    max-width: 100%;
    padding-bottom: ${props => props.theme.spacing.margin.l};
    padding-top: ${props => props.theme.spacing.margin.m};
`;

const getPageHeaderTitle = (variant?: BrowseJobsPageVariants) =>
    cond<BrowseJobsPageVariants | undefined, string>([
        [
            equals<BrowseJobsPageVariants | undefined>(BrowseJobsPageVariants.BUSINESS_APPS),
            always('browseBusinessAppJobs_pageTitle'),
        ],
        [
            equals<BrowseJobsPageVariants | undefined>(BrowseJobsPageVariants.INTELLIGENT_CLOUD),
            always('browseIntelligentCloudJobs_pageTitle'),
        ],
        [
            equals<BrowseJobsPageVariants | undefined>(BrowseJobsPageVariants.MODERN_WORKPLACE),
            always('browseModernWorkplaceJobs_pageTitle'),
        ],
        [T, always('browseJobs_header')],
    ])(variant);

const getBreadcrumbTitle = (variant?: BrowseJobsPageVariants) =>
    cond<BrowseJobsPageVariants | undefined, string>([
        [
            equals<BrowseJobsPageVariants | undefined>(BrowseJobsPageVariants.BUSINESS_APPS),
            always('browseBusinessAppJobs_breadcrumb'),
        ],
        [
            equals<BrowseJobsPageVariants | undefined>(BrowseJobsPageVariants.INTELLIGENT_CLOUD),
            always('browseIntelligentCloudJobs_breadcrumb'),
        ],
        [
            equals<BrowseJobsPageVariants | undefined>(BrowseJobsPageVariants.MODERN_WORKPLACE),
            always('browseModernWorkplaceJobs_breadcrumb'),
        ],
        [T, always('browseJobs_header')],
    ])(variant);

interface BrandAttributeProps {
    customBullet?: 'orangeBullet';
    fontWeight?: string;
    bgColor?: string;
}

const getBrandAttributes = (brand: string) =>
    cond<string, BrandAttributeProps>([
        [equals('Nigel'), always({ customBullet: 'orangeBullet' })],
        [equals('Washington'), always({ customBullet: 'orangeBullet', fontWeight: 'semibold', bgColor: 'white' })],
        [equals('FrgTech'), always({ fontWeight: 'semibold', bgColor: 'white' })],
        [T, always({})],
    ])(brand);

/* eslint-disable indent */
const formatVanityUrls = (t: TFunction) =>
    pipe<VanityUrls, VanityUrl[], Record<string, VanityUrl[]>, SearchLinkObjectProps[]>(
        (urlDefinitions: VanityUrls): VanityUrl[] => values<VanityUrls, string>(urlDefinitions),
        (urls: VanityUrl[]): Record<string, VanityUrl[]> => groupBy(x => x.category, urls),
        (grouped: Record<string, VanityUrl[]>) =>
            reduce<string, SearchLinkObjectProps[]>(
                (acc, category) =>
                    category
                        ? [
                              ...acc,
                              {
                                  title: t(category),
                                  links: grouped[category],
                              },
                          ]
                        : acc,
                [],
                keys(grouped),
            ),
    );
/* eslint-enable indent */

const StandardBrowseJobsPage = ({
    formatedVanityUrls,
    customBullet,
}: {
    formatedVanityUrls: SearchLinkObjectProps[];
    customBullet?: string;
    containerBgColor?: string;
}) => (
    <Container marginTop marginBottom>
        <BrowseJobCards>
            {map(link => {
                return (
                    <SearchLinksCard
                        key={link.title}
                        title={link.title}
                        links={link.links}
                        customBullet={customBullet}
                    />
                );
            }, formatedVanityUrls)}
        </BrowseJobCards>
    </Container>
);

const BrowseJobsPageContent = ({
    brand,
    useStandardBrowseJobsPage,
    formatedVanityUrls,
    customBullet,
    containerBgColor,
}: {
    brand: string;
    useStandardBrowseJobsPage: boolean;
    formatedVanityUrls: SearchLinkObjectProps[];
    customBullet?: string;
    containerBgColor?: string;
}) => {
    if (brand === 'Nigel') {
        // we use the standard browse jobs page for the browse by segement pages
        // but the collapsible nav for the main browsr jobs page
        return useStandardBrowseJobsPage ? (
            <StandardBrowseJobsPage formatedVanityUrls={formatedVanityUrls} customBullet={customBullet} />
        ) : (
            <CollapsibleNavContainer>
                <NigelCollapsibleNav />
            </CollapsibleNavContainer>
        );
    }
    return (
        <StandardBrowseJobsPage
            formatedVanityUrls={formatedVanityUrls}
            customBullet={customBullet}
            containerBgColor={containerBgColor}
        />
    );
};

const BrowseJobsPage: NextPage<BrowseJobsPageProps> = ({ variant }: BrowseJobsPageProps) => {
    const { t } = useTranslation();
    const {
        brand,
        brandData: { jobVanityUrls, jobVanityVariantUrls },
    } = useContext(BrandContext);

    const vanityUrls = variant ? (jobVanityVariantUrls ? jobVanityVariantUrls[variant] : {}) : jobVanityUrls;
    const formatedVanityUrls = formatVanityUrls(t)(vanityUrls);

    const breadcrumbs = [
        {
            url: '/',
            label: t('pageNav_home'),
        },
        {
            url: '/job-seekers',
            label: t('pageNav_employee'),
        },
    ];

    const pageHeaderTitle = getPageHeaderTitle(variant);
    const pageBreadcrumbTitle = getBreadcrumbTitle(variant);
    const attributes = getBrandAttributes(brand);

    return (
        <>
            {attributes.bgColor ? <OverrideBodyBgColor bgColor={attributes.bgColor} /> : null}
            <PageHeader
                breadCrumbTitle={t(pageBreadcrumbTitle)}
                image="browseJobs"
                breadcrumbs={breadcrumbs}
                title={t(pageHeaderTitle)}
                fontWeight={attributes.fontWeight}
            />
            <BrowseJobsPageContent
                brand={brand}
                useStandardBrowseJobsPage={!!variant}
                formatedVanityUrls={formatedVanityUrls}
                customBullet={attributes.customBullet}
            />
        </>
    );
};

export default BrowseJobsPage;
