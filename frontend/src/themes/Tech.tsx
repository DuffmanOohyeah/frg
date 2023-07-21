import Tokens from './tokens';
import makeBaseStyles from './styles/Base';
import themeStyles from './styles/Tech';
import logos from './logos/Tech';
import heroes from './heroes/Tech';
import mergeDeep from 'ramda/src/mergeDeepRight';

const brand = 'Tech';
const themeTokens = Tokens(brand);
const styles = mergeDeep(makeBaseStyles(brand), themeStyles);

export const TechThemeLogos = {
    ...logos,
};

const theme = {
    name: brand,
    ...themeTokens,
    ...heroes,
    ...styles,
};

export default theme;
