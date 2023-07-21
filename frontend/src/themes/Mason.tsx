import Tokens from './tokens';
import makeBaseStyles from './styles/Base';
import themeStyles from './styles/Mason';
import logos from './logos/Mason';
import heroes from './heroes/Mason';
import mergeDeep from 'ramda/src/mergeDeepRight';

const brand = 'Mason';
const themeTokens = Tokens(brand);
const styles = mergeDeep(makeBaseStyles(brand), themeStyles);

export const MasonThemeLogos = {
    ...logos,
};

const theme = {
    name: brand,
    ...themeTokens,
    ...styles,
    ...heroes,
};

export default theme;
