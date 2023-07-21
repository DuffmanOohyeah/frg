import { equals, cond, always } from 'ramda';

export const DEFAULT_LANG = 'en';

const getAdditionalLanguages = cond<string, Array<string>>([
    [equals('Anderson'), always([])],
    [equals('Mason'), always(['de'])],
    [equals('Nelson'), always([])],
    [equals('Nigel'), always(['de', 'fr', 'it', 'pl', 'nl', 'es'])],
    [equals('Jefferson'), always(['de', 'fr'])],
    [equals('Washington'), always([])],
    [equals('FrgTech'), always([])],
]);

export default getAdditionalLanguages;
