import React from 'react';
import { cond, equals, always } from 'ramda';

const getTypekit = cond<string, React.ReactElement>([
    [equals('Anderson'), always(<link rel="stylesheet" href="https://use.typekit.net/spm0tmz.css" />)],
    [equals('Mason'), always(<link rel="stylesheet" href="https://use.typekit.net/adk6xbb.css" />)],
    [equals('Nelson'), always(<link rel="stylesheet" href="https://use.typekit.net/dnh3woe.css" />)],
    [
        equals('Nigel'),
        always(
            <>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    // eslint-disable-next-line max-len
                    href="https://fonts.googleapis.com/css2?family=Merriweather:wght@200;300;400&family=Noto+Sans&display=swap"
                />
            </>,
        ),
    ],
    [equals('Jefferson'), always(<link rel="stylesheet" href="https://use.typekit.net/dku6wil.css" />)],
    [equals('Washington'), always(<link rel="stylesheet" href="https://use.typekit.net/olu4zxc.css" />)],
    [equals('FrgTech'), always(<link rel="stylesheet" href="https://use.typekit.net/lol3qpz.css" />)],
]);

export default getTypekit;
