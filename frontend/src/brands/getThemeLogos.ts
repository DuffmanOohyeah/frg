import { cond, equals, always } from 'ramda';

import { AndersonThemeLogos } from '../themes/Anderson';
import { JeffersonThemeLogos } from '../themes/Jefferson';
import { MasonThemeLogos } from '../themes/Mason';
import { NelsonThemeLogos } from '../themes/Nelson';
import { NigelThemeLogos } from '../themes/Nigel';
import { TechThemeLogos } from '../themes/Tech';
import { ThemeLogos } from '../themes/theme';
import { WashingtonThemeLogos } from '../themes/Washington';

const getThemeLogos = cond<string, ThemeLogos>([
    [equals('Anderson'), always(AndersonThemeLogos)],
    [equals('Mason'), always(MasonThemeLogos)],
    [equals('Nelson'), always(NelsonThemeLogos)],
    [equals('Nigel'), always(NigelThemeLogos)],
    [equals('Jefferson'), always(JeffersonThemeLogos)],
    [equals('Washington'), always(WashingtonThemeLogos)],
    [equals('FrgTech'), always(TechThemeLogos)],
]);

export default getThemeLogos;
