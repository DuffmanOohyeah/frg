import { NextPage } from 'next';
import getDomain from '../brands/getDomain';
import { getConfigServer } from '../client';

// TODO make brand and url agnostic
const robotsTxt = (brand: string): string => `
User-agent: *
Disallow: /wp-admin/*
Disallow: /*/referral-scheme/
Disallow: /profile
Disallow: /saved-jobs
Disallow: /dashboard
Disallow: /job-matches
Disallow: /job-applications
Disallow: /candidate/
Disallow: */candidate/*

Disallow: /*?keyword=
Disallow: *.pdf

Disallow: /*?*newJobs=
Disallow: /*?*keyword=
Disallow: /*?*location=
Disallow: /*?*jobType=
Disallow: /*?*remote=
Disallow: /*?*security=
Disallow: /*?*salaryFrom=
Disallow: /*?*salaryTo=
Disallow: /*?*salaryCurrency=
Disallow: /*?*jobTitles=
Disallow: /*?*keyword=
Disallow: /*?*level=
Disallow: /*?*newCandidates=
Disallow: /*?*page=
Disallow: /*?*role=
Disallow: /*?*skills=
Disallow: /*?*utm_medium=
Disallow: /*?*utm_source=
Disallow: /*?*utm_=*

User-agent: 007ac9
User-agent: trovitBot
User-agent: istellabot
User-agent: GermCrawler
User-agent: Kraken
User-agent: JobboerseBot
Crawl-delay: 60

User-agent: Baiduspider
User-agent: DotBot
User-agent: DuckDuckBot
User-agent: Exabot
User-agent: AhrefsBot
User-agent: Buzzbot
User-agent: YandexBot
Crawl-delay: 20

User-agent: archive.org_bot
User-agent: Screaming Frog SEO Spider
User-agent: Googlebot
User-agent: Bingbot
User-agent: Twitterbot
User-agent: Apple-PubSub
Crawl-delay: 1

Sitemap: https://www.${getDomain(brand)}.com/sitemap.xml
`;

// We never hit this in the client and we should never be rendering on
// the serverside since we do a response.write
const RobotsPage: NextPage = () => {
    return null;
};

RobotsPage.getInitialProps = async (ctx): Promise<void> => {
    if (ctx.req && ctx.res) {
        const config = await getConfigServer();
        const response = ctx.res;
        response.setHeader('Content-Type', 'text/plain');
        response.write(robotsTxt(config.brand));
        response.end();
    }
    return undefined;
};

export default RobotsPage;
