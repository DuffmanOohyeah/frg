import gql from 'graphql-tag';
import { wrapQuery } from './util';

export interface LinkSiteVisitorToPardotAccountParams {
    trackingId: string;
}

export interface LinkSiteVisitorToPardotAccountData {
    linkSiteVisitorToPardotAccount: {
        prospectId: number;
    };
}

export const LinkSiteVisitorToPardotAccount = gql`
    query linkSiteVisitorToPardotAccount($trackingId: String!) {
        linkSiteVisitorToPardotAccount(trackingId: $trackingId) {
            prospectId
        }
    }
`;

export const linkSiteVisitorToPardotAccount = wrapQuery<
    LinkSiteVisitorToPardotAccountParams,
    LinkSiteVisitorToPardotAccountData
>(LinkSiteVisitorToPardotAccount);
