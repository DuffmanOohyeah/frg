import React from 'react';
import getAdditionalLanguages from './getAdditionalLanguages';
import getDomain from './getDomain';

const makeDefaultHrefLangLink = (path: string, domain: string): JSX.Element => (
    <link rel="alternate" key="default" hrefLang="x-default" href={`https://www.${domain}.com${path}`} />
);

const makeHrefLangLink = (language: string, path: string, domain: string): JSX.Element => (
    <link rel="alternate" key={language} hrefLang={language} href={`https://www.${domain}.com/${language}${path}`} />
);

const getHrefLang = (brand: string, path: string, lang?: string): JSX.Element[] => {
    const notLangPath = lang ? path.replace(`/${lang}`, '') : path;
    const domain = getDomain(brand);
    const englishLink = makeDefaultHrefLangLink(notLangPath, domain);
    const additionalLanguages = getAdditionalLanguages(brand);
    const additionalLinks = additionalLanguages.map(language => makeHrefLangLink(language, notLangPath, domain));
    return [englishLink, ...additionalLinks];
};

export default getHrefLang;
