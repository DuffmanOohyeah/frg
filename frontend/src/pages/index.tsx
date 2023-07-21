import { NextPage } from 'next';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import getJobSearchUrl from '../brands/getJobSearchUrl';
import HomeHero from '../components/patterns/HomeHero/homeHero';
import makeStatsList from '../components/patterns/HomeHero/homeHeroData';
import HomeTestimonials from '../components/patterns/HomeTestimonials/HomeTestimonials';
import SalarySurveyBanner from '../components/patterns/SalarySurveyBanner/SalarySurveyBanner';
import NigelSalarySuveyBanner from '../components/brands/Nigel/SalarySurveyBanner/SalarySurveyBanner';
import NigelAzureSurveyBanner from '../components/brands/Nigel/AzureSurveyBanner/AzureSurveyBanner';
import HomeTemplate from '../components/templates/Nelson/Home/Home';
import { BrandContext } from '../components/utils/WithBrand';
import frgI18n from '../i18n/frgI18n';
import { JobType } from '../types';
import { always, cond, equals, T } from 'ramda';
import WFIEpicorSalarySurveyBanner from '../components/brands/Washington/SalarySurveyBanners/Epicor';
import WFISytelineSalarySurveyBanner from '../components/brands/Washington/SalarySurveyBanners/Syteline';
import styled from 'styled-components';

interface PaddedCellProps {
    bgColor: 'light';
    padding: 'xs';
}

const PaddedCell = styled.div<PaddedCellProps>`
    ${props => `
        background-color: ${props.theme.colors[props.bgColor]};
        padding: ${props.theme.spacing.padding[props.padding]};
    `}
`;

const HomeBanners = ({ brand }: { brand: string }) =>
    cond<string, JSX.Element | null>([
        [
            equals('Nigel'),
            always(
                <>
                    <NigelSalarySuveyBanner />
                    <NigelAzureSurveyBanner />
                </>,
            ),
        ],
        [
            equals('Washington'),
            always(
                <>
                    <WFIEpicorSalarySurveyBanner />
                    <WFISytelineSalarySurveyBanner />
                    <PaddedCell bgColor="light" padding="xs" />
                </>,
            ),
        ],
        [equals('FrgTech'), always(null)],
        [T, always(<SalarySurveyBanner />)],
    ])(brand);

const HomePage: NextPage = () => {
    const { t } = useTranslation();
    const router = frgI18n.useRouter();
    const { brand } = useContext(BrandContext);

    const handleClickSearchJobs = ({
        keyword,
        location,
        jobType,
        segment,
        product,
    }: {
        keyword: string;
        location: string;
        jobType: JobType;
        segment?: string;
        product?: string;
    }): void => {
        router.push(
            {
                pathname: '/[...path]',
                query: { keyword, location, jobType, product, segment },
            },
            getJobSearchUrl(brand),
        );
    };
    return (
        <>
            <HomeTemplate>
                <HomeHero
                    heading={t('home_hero_header')}
                    statement={t('home_hero_statement')}
                    intro={t('home_intro_body')}
                    stats={makeStatsList(t, brand)}
                    onSearch={handleClickSearchJobs}
                />
                <HomeBanners brand={brand} />
                <HomeTestimonials />
            </HomeTemplate>
        </>
    );
};

export default HomePage;
