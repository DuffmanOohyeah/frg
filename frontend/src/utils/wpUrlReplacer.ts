import { always, cond, equals } from 'ramda';

const makeBrandRegex = (brand: string): RegExp =>
    cond<string, RegExp>([
        [equals<string>('Anderson'), always(/ href="https:\/\/stage.andersonfrank.com/gi)],
        [equals<string>('Mason'), always(/ href="https:\/\/stage.masonfrank.com/gi)],
        [equals<string>('Nelson'), always(/ href="https:\/\/stage.nelsonfrank.com/gi)],
        [equals<string>('Nigel'), always(/ href="https:\/\/stage.nigelfrank.com/gi)],
        [equals<string>('Jefferson'), always(/ href="https:\/\/stage.jeffersonfrank.com/gi)],
        [equals<string>('Washington'), always(/ href="https:\/\/stage.washingtonfrank.com/gi)],
        [equals<string>('FrgTech'), always(/ href="https:\/\/stage.frgconsulting.com/gi)],
    ])(brand);

const makeBrandUrl = (brand: string): string =>
    cond<string, string>([
        [equals<string>('Anderson'), always(' href="https://andersonfrank.com')],
        [equals<string>('Mason'), always(' href="https://masonfrank.com')],
        [equals<string>('Nelson'), always(' href="https://nelsonfrank.com')],
        [equals<string>('Nigel'), always(' href="https://nigelfrank.com')],
        [equals<string>('Jefferson'), always(' href="https://jeffersonfrank.com')],
        [equals<string>('Washington'), always(' href="https://washingtonfrank.com')],
        [equals<string>('FrgTech'), always(' href="https://frgconsulting.com')],
    ])(brand);

const wpUrlReplacer = (html: string, brand: string): string => html.replace(makeBrandRegex(brand), makeBrandUrl(brand));

export default wpUrlReplacer;
