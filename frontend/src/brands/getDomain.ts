import { cond, equals, always } from 'ramda';

export const getStagingDomain = brand => {
    let domain = 'https://';

    /* eslint-disable indent */
    switch (brand) {
        case 'Anderson':
            domain += 'anderson-frank';
            break;
        case 'FrgTech':
            domain += 'frg-tech';
            break;
        case 'Jefferson':
            domain += 'jefferson-frank';
            break;
        case 'Mason':
            domain += 'mason-frank';
            break;
        case 'Nelson':
            domain += 'nelson-frank';
            break;
        case 'Nigel':
            domain += 'nigel-frank';
            break;
        case 'Washington':
            domain += 'washington-frank';
            break;
    }
    /* eslint-enable indent */

    return (domain += '.stage.frg-nextgen.co.uk');
};

const getDomain = cond<string, string>([
    [equals('Anderson'), always('andersonfrank')],
    [equals('Mason'), always('masonfrank')],
    [equals('Nelson'), always('nelsonfrank')],
    [equals('Nigel'), always('nigelfrank')],
    [equals('Jefferson'), always('jeffersonfrank')],
    [equals('Washington'), always('washingtonfrank')],
    [equals('FrgTech'), always('frgconsulting')],
]);

export default getDomain;
