import Tokens from './tokens';
import makeBaseStyles from './styles/Base';
import themeStyles from './styles/Washington';
import logos from './logos/Washington';
import heroes from './heroes/Washington';
import mergeDeep from 'ramda/src/mergeDeepRight';
import genericImages from './genericImages/Washington';

const brand = 'Washington';
const themeTokens = Tokens(brand);
const styles = mergeDeep(makeBaseStyles(brand), themeStyles);

export const WashingtonThemeLogos = {
    ...logos,
};

const theme = {
    name: brand,
    ...themeTokens,
    ...heroes,
    ...styles,
    ...genericImages,
};

export default theme;
