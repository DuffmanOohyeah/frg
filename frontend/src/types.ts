declare global {
    interface Window {
        gtag: (command: 'event', eventName: string, eventParams: Record<string, unknown>) => void;
    }
}

export enum JobType {
    Permanent = 'permanent',
    Contract = 'contract',
    Both = 'both',
}

export interface SearchFilterNameAndCount {
    key: string;
    docCount?: number;
    value?: string;
}

export interface BreadcrumbItem {
    url: string;
    label: string;
}

export enum CookieTypes {
    GoogleTagManager = 'googleTagManager',
    Driftt = 'driftt',
    Hotjar = 'hotjar',
    Pardot = 'pardot',
}

export const cookieName = 'rejectedCookies';
