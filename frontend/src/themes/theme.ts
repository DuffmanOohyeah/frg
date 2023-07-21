import React from 'react';

interface Logo {
    height: string;
    width: string;
    img: React.ReactElement;
}

export interface ThemeLogos {
    logos: {
        regular: Logo;
        small?: Logo;
        white: Logo;
    };
}

export interface ThemeWithoutLogos {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    colors?: {
        accent?: string;
        primary?: string;
        secondary?: string;
        text?: string;
        light?: string;
        negative?: string;
        positive?: string;
        icons?: string;
        white?: string;
        muted?: string;
        grey?: string;
        primaryGradient?: string;
        primaryGradientHorizontal?: string;
        secondaryGradient?: string;
        modalBackground?: string;
        tertiaryGradient?: string;
        lightPrimary?: string;
    };
    typography?: {
        fontFamily: string;
        headingFontFamily: string;
        headingFontStyle: string;
        fontStyle: string;
        fontSize: {
            large: string;
            regular: string;
            small: string;
            smallest: string;
            alpha: string;
            beta: string;
            gamma: string;
            delta: string;
        };
        fontSizeMediumViewport: {
            large: string;
            regular: string;
            small: string;
            smallest: string;
            alpha: string;
            beta: string;
            gamma: string;
            delta: string;
        };

        fontSizeSmallViewport: {
            large: string;
            regular: string;
            small: string;
            smallest: string;
            alpha: string;
            beta: string;
            gamma: string;
            delta: string;
        };
        fontWeight: {
            regular: string;
            medium: string;
            semibold: string;
            bold: string;
        };
        headingFontWeight: string;
        headingTextTransform: string;
        lineHeight: {
            regular: string;
            alpha: string;
            beta: string;
            gamma: string;
            delta: string;
        };
    };
    heroes: {
        advertiseJob?: string;
        browseCandidates?: string;
        browseJobs?: string;
        home?: string;
        search?: string;
        salarySurvey?: string;
        termsOfBusiness?: string;
    };
    icons: {
        submitYourJob: {
            iconConsultant?: string;
            iconShortList?: string;
            iconFast?: string;
            iconGlobal?: string;
            iconAdvice?: string;
        };
        termsOfBusiness: {
            iconOne?: string;
            iconTwo?: string;
            iconThree?: string;
        };
    };
    // When someone has a moment we should fill out the rest of this type
}

export interface Theme extends ThemeWithoutLogos, ThemeLogos {}
