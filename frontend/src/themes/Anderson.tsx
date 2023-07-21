import Tokens from './tokens';
import makeBaseStyles from './styles/Base';
import themeStyles from './styles/Anderson';
import logos from './logos/Anderson';
import heroes from './heroes/Anderson';
import mergeDeep from 'ramda/src/mergeDeepRight';

const brand = 'Anderson';
const themeTokens = Tokens(brand);
const styles = mergeDeep(makeBaseStyles(brand), themeStyles);

export const AndersonThemeLogos = {
    ...logos,
};

const theme = {
    name: brand,
    ...themeTokens,
    ...styles,
    ...heroes,
};

export default theme;
