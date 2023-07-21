import React from 'react';
import { cond, equals, always } from 'ramda';

const getFacebookVerification = cond<string, React.ReactElement>([
    [equals('Anderson'), always(<></>)],
    [equals('Mason'), always(<></>)],
    [equals('Nelson'), always(<></>)],
    [equals('Nigel'), always(<></>)],
    [
        equals('Jefferson'),
        always(<meta name="facebook-domain-verification" content="0pc7zzwb9smwziftgdpe5e702y260w" />),
    ],
    [equals('Washington'), always(<></>)],
    [equals('FrgTech'), always(<></>)],
]);

export default getFacebookVerification;
