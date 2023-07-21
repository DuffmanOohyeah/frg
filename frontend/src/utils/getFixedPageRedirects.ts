import { always, cond, equals } from 'ramda';
import jeffersonPageRedirects from './pageRedirects/jeffersonPageRedirects';
import masonPageRedirects from './pageRedirects/masonPageRedirects';
import nelsonPageRedirects from './pageRedirects/nelsonPageRedirects';
import andersonPageRedirects from './pageRedirects/andersonPageRedirects';
import nigelPageRedirects from './pageRedirects/nigelPageRedirects';
import washingtonPageRedirects from './pageRedirects/washingtonPageRedirects';
import techPageRedirects from './pageRedirects/techPageRedirects';
import { ServerResponse } from 'http';

interface PageRedirects {
    source: (rawAsPath: string) => boolean;
    destination: (rawAsPath: string) => string;
    code?: number;
}

// get fixed page redirects per brand
// checks if current path needs redirecting
// redirects if it does need redirecting
export const redirectIfFixedPageRedirect = (brand: string, path: string, res?: ServerResponse) => {
    const brandFixedPageRedirects = getFixedPageRedirects(brand);
    const fixedPageRedirect = brandFixedPageRedirects.find(redirect => redirect.source(path));
    if (fixedPageRedirect && res) {
        res.writeHead(301, {
            location: fixedPageRedirect.destination(path),
        });
        res.end();
    }
};

const getFixedPageRedirects = (brand: string): PageRedirects[] =>
    cond<string, PageRedirects[]>([
        [equals('Anderson'), always(andersonPageRedirects)],
        [equals('Mason'), always(masonPageRedirects)],
        [equals('Nelson'), always(nelsonPageRedirects)],
        [equals('Nigel'), always(nigelPageRedirects)],
        [equals('Jefferson'), always(jeffersonPageRedirects)],
        [equals('Washington'), always(washingtonPageRedirects)],
        [equals('FrgTech'), always(techPageRedirects)],
    ])(brand);
