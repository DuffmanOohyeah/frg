import Tokens from './tokens';
import makeBaseStyles from './styles/Base';
import themeStyles from './styles/Jefferson';
import logos from './logos/Jefferson';
import heroes from './heroes/Jefferson';
import mergeDeep from 'ramda/src/mergeDeepRight';

const brand = 'Jefferson';
const themeTokens = Tokens(brand);
const styles = mergeDeep(makeBaseStyles(brand), themeStyles);

export const JeffersonThemeLogos = {
    ...logos,
};

const theme = {
    ...heroes,
    name: brand,
    ...themeTokens,
    ...styles,
};

export default theme;
