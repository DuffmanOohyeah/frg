/*
  This is a Link component which wraps the NextLink but will automatically prepend
  language paths to the url. Borrowed alot of this from:
  https://github.com/isaachinman/next-i18next/blob/f8a555ec5901a0a71a01b0aedc7eca2c4c7be054/src/components/Link.tsx
  as it's still in beta so I'm just going to use the bits we need (can't get beta to deploy atm)
*/

import React from 'react';
import NextLink, { LinkProps } from 'next/link';
import i18nNextAs from './i18nNextAs';
import i18nNextHref from './i18nNextHref';

interface I18nLinkProps extends LinkProps {
    children: React.ReactNode;
}

const I18nLink = ({
    href: originalHref,
    as: originalAs,
    children,
    ...linkProps
}: I18nLinkProps): React.ReactElement => {
    const href = i18nNextHref(originalHref);
    const as = i18nNextAs(originalAs, originalHref);

    return (
        <NextLink href={href} as={as} {...linkProps}>
            {children}
        </NextLink>
    );
};

interface InsideTransProps {
    href: string;
    label: React.ReactElement;
}

export const I18nLinkInsideTrans = ({ href, label }: InsideTransProps) => {
    return (
        <I18nLink href={href} passHref>
            {label}
        </I18nLink>
    );
};

export default I18nLink;
