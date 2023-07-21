import React, { useContext } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { useTranslation, Trans } from 'react-i18next';
import SubmitAJobForm from '../components/patterns/PardotForms/SubmitAJobForm';
import FormContentPage from '../components/templates/FormContentPage/FormContentPage';
import Heading from '../components/bits/Headings/Headings';
import Callout from '../components/bits/Callout/Callout';
import BodyCopy from '../components/bits/BodyCopy/BodyCopy';
import { List } from '../components/bits/List/List';
import { BrandListItem } from '../components/bits/BrandIconList/BrandIconList';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../components/utils/WithBrand';

const BrandIconList = styled(List)`
    margin-left: 0 !important;
`;

const SubmitAJobPageHeading = styled(Heading)`
    color: ${props => props.theme.submitAJob.heading};
    ${props => (props.theme.submitAJob.headFontSize ? `font-size: ${props.theme.submitAJob.headFontSize};` : null)}
    ${props =>
        props.theme.submitAJob.headFontWeight ? `font-weight: ${props.theme.submitAJob.headFontWeight};` : null}
`;

interface BrandAttributeProps {
    bodyColor?: 'primary' | 'secondary' | 'accent' | 'text' | 'positive' | 'negative' | 'white' | 'darkGrey';
    headingSize?: 'alpha' | 'beta' | 'gamma' | 'delta' | 'regular' | 'xxLarge';
    headingWeight?: string;
    headingColor:
        | 'primary'
        | 'secondary'
        | 'accent'
        | 'text'
        | 'positive'
        | 'negative'
        | 'white'
        | 'orange2'
        | 'darkGrey'
        | 'blue'
        | 'yellow';
}

const getBrandAttributes = (brand: string) =>
    cond<string, BrandAttributeProps>([
        [
            equals('Washington'),
            always({
                headingColor: 'orange2',
                bodyColor: 'darkGrey',
                headingSize: 'xxLarge',
                headingWeight: 'semibold',
            }),
        ],
        [equals('FrgTech'), always({ headingColor: 'blue', headingSize: 'xxLarge' })],
        [T, always({ headingColor: 'accent', headingSize: 'gamma' })],
    ])(brand);

const SubmitYourJobPage: NextPage = () => {
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

    const { brand, brandData } = useContext(BrandContext);
    const attributes = getBrandAttributes(brand);

    const form = <SubmitAJobForm />;
    const content = (
        <>
            <SubmitAJobPageHeading
                as="h2"
                size={attributes.headingSize || 'gamma'}
                color={attributes.headingColor}
                fontWeight={attributes.headingWeight}
            >
                {t('submitAJobPage_intro')}
            </SubmitAJobPageHeading>
            <BodyCopy textColor={attributes.bodyColor}>
                <Trans i18nKey="submitAJobPage_body" />
                <Callout size="large">{t('submitAJobPage_listHeader')}</Callout>
                <BrandIconList>
                    <BrandListItem
                        icon={brandData.theme.icons.submitYourJob.iconConsultant}
                        content={t('submitAJobPage_list_consultant')}
                    />
                    <BrandListItem
                        icon={brandData.theme.icons.submitYourJob.iconShortList}
                        content={t('submitAJobPage_list_shortlist')}
                    />
                    <BrandListItem
                        icon={brandData.theme.icons.submitYourJob.iconFast}
                        content={t('submitAJobPage_list_fast')}
                    />
                    <BrandListItem
                        icon={brandData.theme.icons.submitYourJob.iconGlobal}
                        content={t('submitAJobPage_list_global')}
                    />
                    <BrandListItem
                        icon={brandData.theme.icons.submitYourJob.iconAdvice}
                        content={t('submitAJobPage_list_advice')}
                    />
                </BrandIconList>
            </BodyCopy>
        </>
    );

    return (
        <FormContentPage
            breadcrumbs={breadcrumbs}
            pageTitle={t('submitAJobPage_pageTitle')}
            title={t('submitAJobPage_header')}
            form={form}
            content={content}
            image="advertiseJob"
        />
    );
};

export default SubmitYourJobPage;
