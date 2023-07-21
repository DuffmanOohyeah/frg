import React, { useContext } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import PageHeader from '../../components/bits/PageHeader/PageHeader';
import BrandIcon from '../../components/bits/Icons/BrandIcons';
import CatchAllError from '../../components/templates/Errors/CatchAllError';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import Trustpilot from '../../components/bits/Trustpilot/Trustpilot';
import StyledStaticPages from '../../components/bits/StaticPages/StaticPages';

const PermJobCards = styled.div`
    ol {
        list-style: none;
        counter-reset: li;
        text-indent: -${props => props.theme.spacing.margin.m};
        margin-left: ${props => props.theme.spacing.margin.m};
    }

    li {
        counter-increment: li;
    }

    li:before {
        content: counter(li) '.';
        color: ${props => props.theme.permanentJobs.headline.color};
        display: inline;
        margin-right: ${props => props.theme.spacing.margin.s};
    }

    color: ${props => props.theme.colors.black};
`;

const PermJobTitle1 = styled.div`
    color: ${props => props.theme.permanentJobs.headline.color};
    font-size: ${props => props.theme.typography.fontSize.xLarge};
    text-align: center;
    font-family: ${props => props.theme.typography.headingFontFamily};
    font-weight: ${props => props.theme.typography.fontWeight.light};
    padding-bottom: ${props => props.theme.spacing.margin.s};
`;

const TestimonialTitle = styled.div`
    font-size: ${props => props.theme.typography.fontSize.large};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const PermJobSubtitle1 = styled.div`
    color: ${props => props.theme.permanentJobs.subTitle.color};
    font-size: ${props => props.theme.typography.fontSize.gamma};
    text-align: center;
`;

const PermJobTestimonial1 = styled.div`
    color: ${props => props.theme.permanentJobs.testimonial.body1Color};
    text-align: center;
`;

const PermJobTitle2 = styled.div`
    color: ${props => props.theme.permanentJobs.subHeadline.color};
    font-size: ${props => props.theme.typography.fontSize.xLarge};
    text-align: center;
    font-family: ${props => props.theme.typography.headingFontFamily};
    font-weight: ${props => props.theme.typography.fontWeight.light};
`;

const AlignIcons = styled.div`
    float: left;
`;

const PermJobBestTalent = styled.div`
    color: ${props => props.theme.permanentJobs.bestTalent.color};
    font-size: ${props => props.theme.typography.fontSize.gamma};
    padding-bottom: ${props => props.theme.spacing.margin.xs};
`;

const SummaryText = styled.div`
    padding-left: 100px;
    padding-bottom: ${props => props.theme.spacing.margin.xs};
`;

const PermJobTestimonial2 = styled.div`
    color: ${props => props.theme.permanentJobs.testimonial.body2Color};
    text-align: center;
`;

const PermJobProcessItem = styled.li`
    color: ${props => props.theme.permanentJobs.subTitle.color};
    padding-bottom: ${props => props.theme.spacing.margin.s};
`;

const getTrustpilot = (brand: string) =>
    cond<string, JSX.Element | null>([
        [equals('Nigel'), always(<Trustpilot dataTags="Candidate" />)],
        [T, always(null)],
    ])(brand);

const PermJobsPage: NextPage = () => {
    const { t } = useTranslation();
    const { brand } = useContext(BrandContext);

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

    const processes = [
        t('jobSeekers_permanent_processCopy1'),
        t('jobSeekers_permanent_processCopy2'),
        t('jobSeekers_permanent_processCopy3'),
        t('jobSeekers_permanent_processCopy4'),
        t('jobSeekers_permanent_processCopy5'),
    ];

    return (
        <>
            <StyledStaticPages>
                <PageHeader
                    title={t('jobSeekers_permanent_pageTitle')}
                    image="jobSeekersPermanent"
                    breadcrumbs={breadcrumbs}
                    breadCrumbTitle={t('jobSeekers_permanent_breadcrumb')}
                    fontWeight="light"
                    boxWidth="50%"
                />
                {getTrustpilot(brand)}
                <PermJobCards>
                    <StyledStaticPages themeColor="white" paddingTop="s" paddingBottom="s">
                        <StyledStaticPages layoutWidth="maxWidth">
                            <PermJobTitle1>{t('jobSeekers_permanent_title1')}</PermJobTitle1>
                            <PermJobSubtitle1>{t('jobSeekers_permanent_subTitle1')}</PermJobSubtitle1>
                            <br />
                            <Trans i18nKey="jobSeekers_permanent_copy1" />
                        </StyledStaticPages>
                    </StyledStaticPages>
                    <StyledStaticPages
                        permanentBgImg={{ parent: 'testimonial', child: 'bg1Color' }}
                        paddingTop="s"
                        paddingBottom="s"
                    >
                        <StyledStaticPages
                            permanentBgImg={{ parent: 'testimonial', child: 'bg1Color' }}
                            layoutWidth="maxWidth"
                        >
                            <PermJobTestimonial1>
                                <TestimonialTitle>
                                    <Trans i18nKey="jobSeekers_permanent_testimonialBody1" />
                                </TestimonialTitle>
                                <br />
                                {t('jobSeekers_permanent_testimonialAuthor1')}
                            </PermJobTestimonial1>
                        </StyledStaticPages>
                    </StyledStaticPages>
                    <StyledStaticPages themeColor="white" paddingTop="s" paddingBottom="s">
                        <StyledStaticPages layoutWidth="maxWidth">
                            <PermJobTitle2>{t('jobSeekers_permanent_title2')}</PermJobTitle2>
                            <br />
                            <AlignIcons>
                                <BrandIcon variant="bestTalent" />
                            </AlignIcons>
                            <SummaryText>
                                <PermJobBestTalent>{t('jobSeekers_permanent_bestTalent_title')}</PermJobBestTalent>
                                <Trans i18nKey="jobSeekers_permanent_bestTalent_body" />
                            </SummaryText>
                            <AlignIcons>
                                <BrandIcon variant="jobSeeker" />
                            </AlignIcons>
                            <SummaryText>
                                <PermJobBestTalent>{t('jobSeekers_permanent_seeker_title')}</PermJobBestTalent>
                                <Trans i18nKey="jobSeekers_permanent_seeker_body" />
                            </SummaryText>
                            <br />
                            <AlignIcons>
                                <BrandIcon variant="insights" />
                            </AlignIcons>
                            <SummaryText>
                                <PermJobBestTalent>{t('jobSeekers_permanent_insights_title')}</PermJobBestTalent>
                                <Trans i18nKey="jobSeekers_permanent_insights_body" />
                            </SummaryText>
                        </StyledStaticPages>
                    </StyledStaticPages>
                    <StyledStaticPages
                        contractBgImg={{ parent: 'testimonial', child: 'bg3Color' }}
                        paddingTop="s"
                        paddingBottom="s"
                    >
                        <StyledStaticPages
                            contractBgImg={{ parent: 'testimonial', child: 'bg3Color' }}
                            layoutWidth="maxWidth"
                        >
                            <PermJobTestimonial2>
                                <TestimonialTitle>
                                    <Trans i18nKey="jobSeekers_permanent_testimonialBody2" />
                                </TestimonialTitle>
                                <br />
                                {t('jobSeekers_permanent_testimonialAuthor2')}
                            </PermJobTestimonial2>
                        </StyledStaticPages>
                    </StyledStaticPages>
                    <StyledStaticPages themeColor="white" paddingTop="s" paddingBottom="s">
                        <StyledStaticPages layoutWidth="maxWidth">
                            <PermJobTitle1>{t('jobSeekers_permanent_title3')}</PermJobTitle1>
                            <br />
                            <ol>
                                {processes.map((item, idx) => {
                                    return <PermJobProcessItem key={idx}>{item}</PermJobProcessItem>;
                                })}
                            </ol>
                        </StyledStaticPages>
                    </StyledStaticPages>
                    <StyledStaticPages
                        permanentBgImg={{ parent: 'testimonial', child: 'bg1Color' }}
                        paddingTop="s"
                        paddingBottom="s"
                    >
                        <StyledStaticPages
                            permanentBgImg={{ parent: 'testimonial', child: 'bg1Color' }}
                            layoutWidth="maxWidth"
                        >
                            <PermJobTestimonial1>
                                <TestimonialTitle>
                                    <Trans i18nKey="jobSeekers_permanent_testimonialBody3" />
                                </TestimonialTitle>
                                <br />
                                {t('jobSeekers_permanent_testimonialAuthor3')}
                            </PermJobTestimonial1>
                        </StyledStaticPages>
                    </StyledStaticPages>
                </PermJobCards>
            </StyledStaticPages>
        </>
    );
};

const getBrandData = (brand: string) =>
    cond<string, JSX.Element>([
        [equals('Anderson'), always(<CatchAllError />)],
        [equals('Mason'), always(<CatchAllError />)],
        [equals('Nelson'), always(<CatchAllError />)],
        [equals('Nigel'), always(<PermJobsPage />)],
        [equals('Jefferson'), always(<CatchAllError />)],
        [equals('Washington'), always(<CatchAllError />)],
        [equals('FrgTech'), always(<CatchAllError />)],
    ])(brand);

const ComponentToRender = () => {
    const { brand } = useContext(BrandContext);
    return getBrandData(brand);
};

export default ComponentToRender;
