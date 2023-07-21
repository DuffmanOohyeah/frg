import i18next, { TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { forEach, isEmpty } from 'ramda';
import { NextRouter } from 'next/router';
import useI18nRouter from './useI18nRouter';
import { getAdditionalLanguages } from '../brands';
import { isValidLanguage } from './isValidLanguage';
import { DEFAULT_LANG } from '../brands/getAdditionalLanguages';
import getI18nResource from './getI18nResource';

// Used for the language changer
// TODO handle this on a brand by brand basis???
export const langOptions = {
    Anderson: {},
    Mason: {
        en: [
            { value: 'en', label: 'English' },
            { value: 'de', label: 'German' },
        ],
        de: [
            { value: 'en', label: 'Englisch' },
            { value: 'de', label: 'Deutsche' },
        ],
    },
    Nelson: {},
    Nigel: {
        en: [
            { value: 'en', label: 'English' },
            { value: 'de', label: 'German' },
            { value: 'fr', label: 'French' },
            { value: 'it', label: 'Italian' },
            { value: 'pl', label: 'Polish' },
            { value: 'nl', label: 'Dutch' },
            { value: 'es', label: 'Spanish' },
        ],
        de: [
            { value: 'en', label: 'Englisch' },
            { value: 'de', label: 'Deutsche' },
            { value: 'fr', label: 'Französisch' },
            { value: 'it', label: 'Italienisch' },
            { value: 'pl', label: 'Polieren' },
            { value: 'nl', label: 'Niederländisch' },
            { value: 'es', label: 'Spanisch' },
        ],
        fr: [
            { value: 'en', label: 'Anglais' },
            { value: 'de', label: 'Allemand' },
            { value: 'fr', label: 'Français' },
            { value: 'it', label: 'Italien' },
            { value: 'pl', label: 'Polonais' },
            { value: 'nl', label: 'Hollandais' },
            { value: 'es', label: 'Espagnol' },
        ],
        it: [
            { value: 'en', label: 'Inglese' },
            { value: 'de', label: 'Tedesco' },
            { value: 'fr', label: 'Francese' },
            { value: 'it', label: 'Italiano' },
            { value: 'pl', label: 'Polacco' },
            { value: 'nl', label: 'Olandese' },
            { value: 'es', label: 'Spagnolo' },
        ],
        pl: [
            { value: 'en', label: 'Angielski' },
            { value: 'de', label: 'Germański' },
            { value: 'fr', label: 'Francuski' },
            { value: 'it', label: 'Italski' },
            { value: 'pl', label: 'Polski' },
            { value: 'nl', label: 'Holenderski' },
            { value: 'es', label: 'Hiszpański' },
        ],
        nl: [
            { value: 'en', label: 'Engels' },
            { value: 'de', label: 'Duitse' },
            { value: 'fr', label: 'Frans' },
            { value: 'it', label: 'Italiaans' },
            { value: 'pl', label: 'Pools' },
            { value: 'nl', label: 'Nederlands' },
            { value: 'es', label: 'Spaans' },
        ],
        es: [
            { value: 'en', label: 'Inglés' },
            { value: 'de', label: 'Alemán' },
            { value: 'fr', label: 'Francés' },
            { value: 'it', label: 'Italiano' },
            { value: 'pl', label: 'Polaco' },
            { value: 'nl', label: 'Holandés' },
            { value: 'es', label: 'Hispano' },
        ],
    },
    Jefferson: {
        en: [
            { value: 'en', label: 'English' },
            { value: 'de', label: 'German' },
            { value: 'fr', label: 'French' },
        ],
        de: [
            { value: 'en', label: 'Englisch' },
            { value: 'de', label: 'Deutsche' },
            { value: 'fr', label: 'Französisch' },
        ],
        fr: [
            { value: 'en', label: 'Anglais' },
            { value: 'de', label: 'Allemand' },
            { value: 'fr', label: 'Français' },
        ],
    },
    Washington: {},
    FrgTech: {},
};

enum FrgI18nStatus {
    UNINITIALISED = 'Uninitisalised',
    INITIALISING = 'Initialising',
    INITIALISED = 'Initialised',
}

interface FrgI18n {
    init: (
        brand: string,
        lang: string,
        i18nResourceServerData?: Record<string, never>,
        force?: boolean,
    ) => Promise<TFunction>;
    useRouter: () => NextRouter;
    languages: string[];
    i18nResourceData: Record<string, never>;
}
const frgI18n = (): FrgI18n => {
    const wrapped = { status: FrgI18nStatus.UNINITIALISED };
    const languages: string[] = [];

    const i18nResourceData: Record<string, never> = {};

    let t: TFunction;

    // I want to be able to check that we have a running instance of this
    // and because i18next.init sets up a "global" instance I'm having to do
    // fancy scope variable stuff to port round a variable to make sure we only init
    // once per a server startup and once per client "full load"
    const init = async (
        brand: string,
        lang = DEFAULT_LANG,
        i18nResourceServerData?: Record<string, never>,
        force = false,
    ): Promise<TFunction> => {
        const additionalLanguages = getAdditionalLanguages(brand);
        const brandLanguages = [DEFAULT_LANG, ...additionalLanguages];
        const langToUse = isValidLanguage(brand, lang) ? lang : DEFAULT_LANG;
        if (wrapped.status === FrgI18nStatus.UNINITIALISED) {
            wrapped.status = FrgI18nStatus.INITIALISING;
            // Clear the array so we don't get duplicates
            languages.splice(0, languages.length);
            forEach(brandLanguage => languages.push(brandLanguage), brandLanguages);
            if (!i18nResourceServerData && isEmpty(i18nResourceData)) await getI18nResource(brand, i18nResourceData);

            t = await i18next
                .use(initReactI18next) // passes i18n down to react-i18next
                .init({
                    resources: i18nResourceServerData || i18nResourceData,
                    lng: langToUse,
                    fallbackLng: 'en',
                    // fallbackLng: 'dev', //use this to replace missing strings with key for dev purposes

                    interpolation: {
                        escapeValue: false,
                    },
                    react: {
                        useSuspense: false,
                    },
                });
            wrapped.status = FrgI18nStatus.INITIALISED;
            return t;
        } else if (force && wrapped.status === FrgI18nStatus.INITIALISED && i18next.language !== langToUse) {
            wrapped.status = FrgI18nStatus.INITIALISING;
            await i18next.changeLanguage(langToUse);
            wrapped.status = FrgI18nStatus.INITIALISED;
        }
        return t;
    };

    // Router is provided here mainly for storybook overriding reasons
    const useRouter = useI18nRouter;

    return { init, useRouter, languages, i18nResourceData };
};

export default frgI18n();
