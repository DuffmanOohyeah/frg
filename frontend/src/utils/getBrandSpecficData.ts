import { TFunction } from 'i18next';
import { always, cond, equals } from 'ramda';
import { VanityUrls } from '../brands/getVanityUrls/VanityUrls';
import { BrowseJobsPageVariants, FooterData, HeaderData } from '../components/utils/WithBrand';
import { ThemeWithoutLogos } from '../themes/theme';

interface NigelVanityUrlsData {
    default: VanityUrls;
    variantVanityUrls: Record<BrowseJobsPageVariants, VanityUrls>;
}

export const getHeaderData = async brand =>
    await cond<string, Promise<(t: TFunction) => HeaderData>>([
        [
            equals('Anderson'),
            () => import('../components/patterns/Header/makeAndersonHeaderData').then(module => module.default),
        ],
        [
            equals('Mason'),
            () => import('../components/patterns/Header/makeMasonHeaderData').then(module => module.default),
        ],
        [
            equals('Nelson'),
            () => import('../components/patterns/Header/makeNelsonHeaderData').then(module => module.default),
        ],
        [
            equals('Nigel'),
            () => import('../components/patterns/Header/makeNigelHeaderData').then(module => module.default),
        ],
        [
            equals('Jefferson'),
            () => import('../components/patterns/Header/makeJeffersonHeaderData').then(module => module.default),
        ],
        [
            equals('Washington'),
            () => import('../components/patterns/Header/makeWashingtonHeaderData').then(module => module.default),
        ],
        [
            equals('FrgTech'),
            () => import('../components/patterns/Header/makeTechHeaderData').then(module => module.default),
        ],
    ])(brand);

export const getJobVanityUrls = async brand =>
    await cond<string, Promise<VanityUrls>>([
        [equals('Anderson'), () => import('../brands/getVanityUrls/jobs/anderson').then(module => module.default)],
        [equals('Mason'), () => import('../brands/getVanityUrls/jobs/mason').then(module => module.default)],
        [equals('Nelson'), () => import('../brands/getVanityUrls/jobs/nelson').then(module => module.default)],
        [equals('Nigel'), () => import('../brands/getVanityUrls/jobs/nigel').then(module => module.default)],
        [equals('Jefferson'), () => import('../brands/getVanityUrls/jobs/jefferson').then(module => module.default)],
        [equals('Washington'), () => import('../brands/getVanityUrls/jobs/washington').then(module => module.default)],
        [equals('FrgTech'), () => import('../brands/getVanityUrls/jobs/tech').then(module => module.default)],
    ])(brand);

export const getJobVanityVariantUrls = async (brand: string) =>
    await cond<string, Promise<Record<BrowseJobsPageVariants, VanityUrls>> | undefined>([
        [equals('Anderson'), always(undefined)],
        [equals('Mason'), always(undefined)],
        [equals('Nelson'), always(undefined)],
        [
            equals('Nigel'),
            () =>
                import('../brands/getVanityUrls/jobs/nigel').then(
                    (module: NigelVanityUrlsData) => module.variantVanityUrls,
                ),
        ],
        [equals('Jefferson'), always(undefined)],
        [equals('Washington'), always(undefined)],
        [equals('FrgTech'), always(undefined)],
    ])(brand);

export const getCandidateVanityUrls = async brand =>
    await cond<string, Promise<VanityUrls>>([
        [
            equals('Anderson'),
            () => import('../brands/getVanityUrls/candidates/anderson').then(module => module.default),
        ],
        [equals('Mason'), () => import('../brands/getVanityUrls/candidates/mason').then(module => module.default)],
        [equals('Nelson'), () => import('../brands/getVanityUrls/candidates/nelson').then(module => module.default)],
        [equals('Nigel'), () => import('../brands/getVanityUrls/candidates/nigel').then(module => module.default)],
        [
            equals('Jefferson'),
            () => import('../brands/getVanityUrls/candidates/jefferson').then(module => module.default),
        ],
        [
            equals('Washington'),
            () => import('../brands/getVanityUrls/candidates/washington').then(module => module.default),
        ],
        [equals('FrgTech'), () => import('../brands/getVanityUrls/candidates/tech').then(module => module.default)],
    ])(brand);

const getTheme = async brand =>
    await cond<string, Promise<ThemeWithoutLogos>>([
        [equals('Anderson'), () => import('../themes/Anderson').then(module => module.default)],
        [equals('Mason'), () => import('../themes/Mason').then(module => module.default)],
        [equals('Nelson'), () => import('../themes/Nelson').then(module => module.default)],
        [equals('Nigel'), () => import('../themes/Nigel').then(module => module.default)],
        [equals('Jefferson'), () => import('../themes/Jefferson').then(module => module.default)],
        [equals('Washington'), () => import('../themes/Washington').then(module => module.default)],
        [equals('FrgTech'), () => import('../themes/Tech').then(module => module.default)],
    ])(brand);

const getFooterData = brand =>
    cond<string, Promise<(t: TFunction) => FooterData>>([
        [
            equals<string>('Anderson'),
            () => import('../components/bits/Footer/FooterNav/MakeAndersonFooterData').then(module => module.default),
        ],
        [
            equals<string>('Mason'),
            () => import('../components/bits/Footer/FooterNav/MakeMasonFooterData').then(module => module.default),
        ],
        [
            equals<string>('Nelson'),
            () => import('../components/bits/Footer/FooterNav/MakeNelsonFooterData').then(module => module.default),
        ],
        [
            equals<string>('Nigel'),
            () => import('../components/bits/Footer/FooterNav/MakeNigelFooterData').then(module => module.default),
        ],
        [
            equals<string>('Jefferson'),
            () => import('../components/bits/Footer/FooterNav/MakeJeffersonFooterData').then(module => module.default),
        ],
        [
            equals<string>('Washington'),
            () => import('../components/bits/Footer/FooterNav/MakeWashingtonFooterData').then(module => module.default),
        ],
        [
            equals<string>('FrgTech'),
            () => import('../components/bits/Footer/FooterNav/MakeTechFooterData').then(module => module.default),
        ],
    ])(brand);

const getBrandSpecficData = async (brand: string, t: TFunction) => {
    const [
        headerDataWithTranslations,
        candidateVanityUrls,
        jobVanityUrls,
        jobVanityVariantUrls,
        theme,
        footerDataWithTranslations,
    ] = await Promise.all([
        getHeaderData(brand),
        getCandidateVanityUrls(brand),
        getJobVanityUrls(brand),
        getJobVanityVariantUrls(brand),
        getTheme(brand),
        getFooterData(brand),
    ]);
    return {
        headerData: headerDataWithTranslations(t),
        candidateVanityUrls,
        jobVanityUrls,
        jobVanityVariantUrls,
        theme,
        footerData: footerDataWithTranslations(t),
    };
};

export default getBrandSpecficData;
