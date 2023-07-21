import React from 'react';
import getDomain from './getDomain';

const hrefLangTemplate = (path: string, domain: string): JSX.Element => (
    <link rel="canonical" href={`https://www.${domain}.com${path}`} />
);

const getCanonical = (brand: string, path: string): JSX.Element => {
    const domain = getDomain(brand);
    const pathWithoutQuery = path.replace(/\?.*/, '');
    const noCandidateDir = pathWithoutQuery.replace(/\/candidate\/.*/, '/candidate-search');
    const link = hrefLangTemplate(noCandidateDir, domain);
    return link;
};

export default getCanonical;
