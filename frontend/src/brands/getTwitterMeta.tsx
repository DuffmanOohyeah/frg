import React from 'react';
import { Config } from '../client';
import { getFullDomain } from './getOgImage';
import getDomain from './getDomain';

const getTwitterMeta = (config: Config): JSX.Element => (
    <>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@FRG" />
        <meta name="twitter:image" content={getFullDomain(config)} />
        <meta name="twitter:site" content={`@${getDomain(config.brand)}`} />
    </>
);

export default getTwitterMeta;
