import React, { useContext } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Container from '../components/utils/Container/Container';
import OverrideBodyBgColor from '../components/utils/OverrideBodyBgColor/OverrideBodyBgColor';
import PageHeader from '../components/bits/PageHeader/PageHeader';
import SearchLinksCard, { SearchLinkProps } from '../components/patterns/SearchLinksCard/SearchLinksCard';
import { pipe, values, keys, map, groupBy, reduce, always, equals, T, cond } from 'ramda';
import { VanityUrl, VanityUrls } from '../brands/getVanityUrls/VanityUrls';
import { BrandContext } from '../components/utils/WithBrand';

const ContainerWrapper = styled.div<BrandAttributeProps>`
    ${props => (props.containerBgColor ? `background-color :${props.containerBgColor};` : null)}
`;

interface SearchLinkObjectProps {
    title?: string;
    links: SearchLinkProps[];
}

const BrowseJobCards = styled.div`
    margin-top: 36px;

    > * + * {
        margin-top: 24px;
    }
`;

interface BrandAttributeProps {
    customBullet?: string;
    headerFontWeight?: 'bold' | 'semibold';
    containerBgColor?: 'white';
    bgColor?: string;
}

const getBrandAttributes = (brand: string) =>
    cond<string, BrandAttributeProps>([
        [
            equals('Washington'),
            always({ customBullet: 'orangeBullet', headerFontWeight: 'bold', containerBgColor: 'white' }),
        ],
        [equals('FrgTech'), always({ headerFontWeight: 'semibold', bgColor: 'white' })],
        [T, always({ customBullet: '' })],
    ])(brand);

const BrowseCandidatesPage: NextPage = () => {
    const { t } = useTranslation();
    const {
        brand,
        brandData: { candidateVanityUrls },
    } = useContext(BrandContext);

    const attributes = getBrandAttributes(brand);

    /* eslint-disable indent */
    const vanityUrls = pipe<VanityUrls, VanityUrl[], Record<string, VanityUrl[]>, SearchLinkObjectProps[]>(
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
    )(candidateVanityUrls);
    /* eslint-enable indent */

    const breadcrumbs = [
        {
            url: '/',
            label: t('pageNav_home'),
        },
        {
            url: '/employers',
            label: t('pageNav_employer'),
        },
    ];

    return (
        <>
            {attributes.bgColor ? <OverrideBodyBgColor bgColor={attributes.bgColor} /> : null}
            <PageHeader
                title={t('browseCandidates_header')}
                image="browseCandidates"
                breadcrumbs={breadcrumbs}
                fontWeight={attributes.headerFontWeight}
            />

            <ContainerWrapper containerBgColor={attributes.containerBgColor}>
                <Container marginTop marginBottom>
                    <BrowseJobCards>
                        {map(link => {
                            return (
                                <SearchLinksCard
                                    key={link.title}
                                    title={link.title}
                                    links={link.links}
                                    customBullet={attributes.customBullet}
                                />
                            );
                        }, vanityUrls)}
                    </BrowseJobCards>
                </Container>
            </ContainerWrapper>
        </>
    );
};

export default BrowseCandidatesPage;
