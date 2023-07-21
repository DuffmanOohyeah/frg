import { NextPage } from 'next';
import React, { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BodyCopy from '../components/bits/BodyCopy/BodyCopy';
import { BrandListItem } from '../components/bits/BrandIconList/BrandIconList';
import Heading from '../components/bits/Headings/Headings';
import { List } from '../components/bits/List/List';
import TermsOfBusinessForm from '../components/patterns/PardotForms/TermsOfBusinessForm';
import FormContentPage from '../components/templates/FormContentPage/FormContentPage';
import { BrandContext } from '../components/utils/WithBrand';

const BrandIconList = styled(List)`
    margin-left: 0 !important;
`;

const TermsOfBusinessHeading = styled(Heading)`
    color: ${props => props.theme.termsOfBusiness.heading || props.theme.colors.accent};
    ${props =>
        props.theme.termsOfBusiness.headFontSize ? `font-size: ${props.theme.termsOfBusiness.headFontSize};` : null}
    ${props =>
        props.theme.termsOfBusiness.headFontWeight
            ? `font-weight: ${props.theme.termsOfBusiness.headFontWeight};`
            : null}
`;

const TermsOfBusinessPage: NextPage = () => {
    const { t } = useTranslation();

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

    const { brandData } = useContext(BrandContext);

    const form = <TermsOfBusinessForm />;
    const content = (
        <>
            <TermsOfBusinessHeading as="h2" size="gamma">
                {t('termsOfBusinessPage_intro')}
            </TermsOfBusinessHeading>
            <BodyCopy>
                <Trans i18nKey="termsOfBusinessPage_body" />
                <BrandIconList>
                    <BrandListItem
                        icon={brandData.theme.icons.termsOfBusiness.iconOne}
                        content={t('termsOfBusinessPage_list_itemOne')}
                    />
                    <BrandListItem
                        icon={brandData.theme.icons.termsOfBusiness.iconTwo}
                        content={t('termsOfBusinessPage_list_itemTwo')}
                    />
                    <BrandListItem
                        icon={brandData.theme.icons.termsOfBusiness.iconThree}
                        content={t('termsOfBusinessPage_list_itemThree')}
                    />
                </BrandIconList>
                <Trans i18nKey="termsOfBusinessPage_list_outro" />
            </BodyCopy>
        </>
    );

    return (
        <FormContentPage
            breadcrumbs={breadcrumbs}
            title={t('termsOfBusinessPage_header')}
            form={form}
            content={content}
            image="termsOfBusiness"
        />
    );
};

export default TermsOfBusinessPage;
