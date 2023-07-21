import Tokens from './tokens';
import makeBaseStyles from './styles/Base';
import themeStyles from './styles/Nelson';
import logos from './logos/Nelson';
import heroes from './heroes/Nelson';
import mergeDeep from 'ramda/src/mergeDeepRight';

const brand = 'Nelson';
const themeTokens = Tokens(brand);
const styles = mergeDeep(makeBaseStyles(brand), themeStyles);

export const NelsonThemeLogos = {
    ...logos,
};

const theme = {
    name: brand,
    ...themeTokens,
    ...styles,
    ...heroes,
};

export default theme;
