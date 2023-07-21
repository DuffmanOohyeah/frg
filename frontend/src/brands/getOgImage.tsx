import React from 'react';
import ogImageJefferson from '../themes/logos/Jefferson/Open-Graph_JFI.jpg';
import ogImageNelson from '../themes/logos/Nelson/Open-Graph_NeFI.jpg';
import ogImageAnderson from '../themes/logos/Anderson/Open-Graph_AFI.jpg';
import ogImageMason from '../themes/logos/Mason/Open-Graph_MFI.jpg';
import ogImageNigel from '../themes/logos/Nigel/Open-Graph_NFI.jpg';
import ogImageWashington from '../themes/logos/Washington/Open-Graph_WFI.jpg';
import ogImageTech from '../themes/logos/Tech/Open-Graph_FRG-tech.jpg';
import { cond, equals, always } from 'ramda';
import getDomain, { getStagingDomain } from './getDomain';
import { Config } from '../client';

const getOgImage = cond<string, string>([
    [equals('Anderson'), always(ogImageAnderson)],
    [equals('Mason'), always(ogImageMason)],
    [equals('Nelson'), always(ogImageNelson)],
    [equals('Nigel'), always(ogImageNigel)],
    [equals('Jefferson'), always(ogImageJefferson)],
    [equals('Washington'), always(ogImageWashington)],
    [equals('FrgTech'), always(ogImageTech)],
]);

export const getFullDomain = (config: Config) => {
    const brand = config.brand;
    const image = getOgImage(brand);
    let domain = getStagingDomain(brand); // staging url
    if (config.useProdPardotEndpoints) {
        domain = `https://www.${getDomain(brand)}.com`; // prod url
    }
    return domain + image;
};

const ogMeta = (ogImage: string): JSX.Element => (
    <>
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:type" content="image/jpg" />
        <meta property="og:image:alt" content="Open graph image" />
    </>
);

const getOgImageMetaTag = (config: Config): JSX.Element => {
    const fullDomain = getFullDomain(config);
    const meta = ogMeta(fullDomain);
    return meta;
};

export default getOgImageMetaTag;
