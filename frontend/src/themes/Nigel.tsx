import Tokens from './tokens';
import makeBaseStyles from './styles/Base';
import themeStyles from './styles/Nigel';
import logos from './logos/Nigel';
import heroes from './heroes/Nigel';
import mergeDeep from 'ramda/src/mergeDeepRight';
import genericImages from './genericImages/Nigel';

const brand = 'Nigel';
const themeTokens = Tokens(brand);
const styles = mergeDeep(makeBaseStyles(brand), themeStyles);

export const NigelThemeLogos = {
    ...logos,
};

const theme = {
    name: brand,
    ...themeTokens,
    ...styles,
    ...heroes,
    ...genericImages,
};

export default theme;
