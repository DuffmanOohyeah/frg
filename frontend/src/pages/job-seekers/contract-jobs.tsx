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

const ContractJobCards = styled.div`
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
        color: ${props => props.theme.contractJobs.headline.color};
        display: inline;
        margin-right: ${props => props.theme.spacing.margin.s};
    }
`;

const TestimonialTitle = styled.div`
    font-size: ${props => props.theme.typography.fontSize.regular};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    font-style: italic;
`;

const ContractJobTitle1 = styled.div`
    color: ${props => props.theme.contractJobs.headline.color};
    font-size: ${props => props.theme.typography.fontSize.beta};
    text-align: center;
    font-family: ${props => props.theme.typography.headingFontFamily};
    font-weight: ${props => props.theme.typography.fontWeight.light};
    padding-bottom: ${props => props.theme.spacing.padding.s};
`;

const ContractJobTestimonial1 = styled.div`
    text-align: center;
    color: ${props => props.theme.contractJobs.testimonial.author1Color};
`;

const ContractJobTitle2 = styled.div`
    color: ${props => props.theme.contractJobs.subHeadline.color};
    font-size: ${props => props.theme.typography.fontSize.xLarge};
    text-align: center;
    font-family: ${props => props.theme.typography.headingFontFamily};
    font-weight: ${props => props.theme.typography.fontWeight.light};
    padding-bottom: ${props => props.theme.spacing.padding.s};
`;

const AlignIcons = styled.div`
    float: left;
    padding-right: ${props => props.theme.spacing.padding.l};
`;

const CopyBlack = styled.div`
    color: ${props => props.theme.contractJobs.copy.charcoal};
`;

const ReasonTitle = styled.div`
    color: ${props => props.theme.contractJobs.copy.secondBlue};
    font-size: ${props => props.theme.typography.fontSize.delta};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    padding-bottom: ${props => props.theme.spacing.margin.s};
`;

const ReasonCopy = styled.div`
    color: ${props => props.theme.contractJobs.copy.charcoal};
`;

const ReasonBlock = styled.div`
    overflow: hidden;
`;

const ContractJobTestimonial2 = styled.div`
    color: ${props => props.theme.contractJobs.testimonial.body2Color};
    text-align: center;
`;

const ContractJobProcessItem = styled.li`
    color: ${props => props.theme.contractJobs.subTitle.color};
    padding-bottom: ${props => props.theme.spacing.margin.xs};
`;

interface ChooseReasonsProps {
    variant: string;
    title: string;
    copy: string;
}

const getTrustpilot = (brand: string) =>
    cond<string, JSX.Element | null>([
        [equals('Nigel'), always(<Trustpilot dataTags="Candidate" />)],
        [T, always(null)],
    ])(brand);

const ContractJobsPage: NextPage = () => {
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
        t('jobSeekers_contract_processCopy1'),
        t('jobSeekers_contract_processCopy2'),
        t('jobSeekers_contract_processCopy3'),
        t('jobSeekers_contract_processCopy4'),
        t('jobSeekers_contract_processCopy5'),
    ];

    const chooseReasons = [
        {
            variant: 'jobSeeker',
            title: t('jobSeekers_contract_chooseReasonTitle1'),
            copy: t('jobSeekers_contract_chooseReasonCopy1'),
        },
        {
            variant: 'insights',
            title: t('jobSeekers_contract_chooseReasonTitle2'),
            copy: t('jobSeekers_contract_chooseReasonCopy2'),
        },
        {
            variant: 'employer',
            title: t('jobSeekers_contract_chooseReasonTitle3'),
            copy: t('jobSeekers_contract_chooseReasonCopy3'),
        },
        {
            variant: 'bestTalent',
            title: t('jobSeekers_contract_chooseReasonTitle4'),
            copy: t('jobSeekers_contract_chooseReasonCopy4'),
        },
    ];

    return (
        <StyledStaticPages>
            <PageHeader
                title={t('jobSeekers_contract_pageTitle')}
                image="jobSeekersContract"
                breadcrumbs={breadcrumbs}
                breadCrumbTitle={t('jobSeekers_contract_breadcrumb')}
                fontWeight="light"
                boxWidth="50%"
            />
            {getTrustpilot(brand)}
            <ContractJobCards>
                <StyledStaticPages themeColor="white" paddingTop="s" paddingBottom="s">
                    <StyledStaticPages layoutWidth="maxWidth">
                        <ContractJobTitle1>
                            <Trans i18nKey="jobSeekers_contract_title1" />
                        </ContractJobTitle1>
                        <CopyBlack>
                            <Trans i18nKey="jobSeekers_contract_copy1" />
                        </CopyBlack>
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
                        <ContractJobTestimonial1>
                            <TestimonialTitle>
                                <Trans i18nKey="jobSeekers_contract_testimonialBody1" />
                            </TestimonialTitle>
                            <br />
                            {t('jobSeekers_contract_testimonialAuthor1')}
                        </ContractJobTestimonial1>
                    </StyledStaticPages>
                </StyledStaticPages>
                <StyledStaticPages themeColor="white" paddingTop="s" paddingBottom="s">
                    <StyledStaticPages layoutWidth="maxWidth">
                        <ContractJobTitle2>{t('jobSeekers_contract_title2')}</ContractJobTitle2>
                        {chooseReasons.map((reason: ChooseReasonsProps, idx: number) => {
                            return (
                                <div key={idx}>
                                    <AlignIcons>
                                        <BrandIcon variant={reason.variant} />
                                    </AlignIcons>
                                    <ReasonBlock>
                                        <ReasonTitle>{reason.title}</ReasonTitle>
                                        <ReasonCopy>
                                            <Trans i18nKey={reason.copy} />
                                        </ReasonCopy>
                                    </ReasonBlock>
                                    <br />
                                </div>
                            );
                        })}
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
                        <ContractJobTestimonial2>
                            <TestimonialTitle>
                                <Trans i18nKey="jobSeekers_contract_testimonialBody2" />
                            </TestimonialTitle>
                            <br />
                            {t('jobSeekers_contract_testimonialAuthor2')}
                        </ContractJobTestimonial2>
                    </StyledStaticPages>
                </StyledStaticPages>
                <StyledStaticPages themeColor="white" paddingTop="s" paddingBottom="s">
                    <StyledStaticPages layoutWidth="maxWidth">
                        <ContractJobTitle1>{t('jobSeekers_contract_title3')}</ContractJobTitle1>
                        <ol>
                            {processes.map((item, idx) => {
                                return <ContractJobProcessItem key={idx}>{item}</ContractJobProcessItem>;
                            })}
                        </ol>
                    </StyledStaticPages>
                </StyledStaticPages>
                <StyledStaticPages
                    contractBgImg={{ parent: 'testimonial', child: 'bg1Color' }}
                    paddingTop="s"
                    paddingBottom="s"
                >
                    <StyledStaticPages
                        contractBgImg={{ parent: 'testimonial', child: 'bg1Color' }}
                        layoutWidth="maxWidth"
                    >
                        <ContractJobTestimonial1>
                            <TestimonialTitle>
                                <Trans i18nKey="jobSeekers_contract_testimonialBody3" />
                            </TestimonialTitle>
                            <br />
                            {t('jobSeekers_contract_testimonialAuthor3')}
                        </ContractJobTestimonial1>
                    </StyledStaticPages>
                </StyledStaticPages>
            </ContractJobCards>
        </StyledStaticPages>
    );
};

const getBrandData = (brand: string) =>
    cond<string, JSX.Element>([
        [equals('Anderson'), always(<CatchAllError />)],
        [equals('Mason'), always(<CatchAllError />)],
        [equals('Nelson'), always(<CatchAllError />)],
        [equals('Nigel'), always(<ContractJobsPage />)],
        [equals('Jefferson'), always(<CatchAllError />)],
        [equals('Washington'), always(<CatchAllError />)],
        [equals('FrgTech'), always(<CatchAllError />)],
    ])(brand);

const ComponentToRender = () => {
    const { brand } = useContext(BrandContext);
    return getBrandData(brand);
};

export default ComponentToRender;
