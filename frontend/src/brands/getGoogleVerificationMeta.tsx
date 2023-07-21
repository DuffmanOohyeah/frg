import React from 'react';
import { cond, equals, always } from 'ramda';

const showGoogleVerificationMeta = cond<string, JSX.Element | null>([
    [equals('Anderson'), always(null)],
    [
        equals('Mason'),
        always(<meta name="google-site-verification" content="XV1fx_15ijInGSLTr_oCf8SZYmO56En9oU4M5awvaTU" />),
    ],
    [
        equals('Nelson'),
        always(<meta name="google-site-verification" content="BMeoI9_rA10PAeNLPcCbViCFXKGmtyHLyjMPynjPKbM" />),
    ],
    [
        equals('Nigel'),
        always(<meta name="google-site-verification" content="f8nwEvn6y084qb6gXFbFB8jxw2BUBoBcvONbodMblSc" />),
    ],
    [equals('Jefferson'), always(null)],
    [equals('Washington'), always(null)],
    [equals('FrgTech'), always(null)],
]);

const getGoogleVerificationMeta = (brand: string): JSX.Element | null => {
    return showGoogleVerificationMeta(brand);
};

export default getGoogleVerificationMeta;
