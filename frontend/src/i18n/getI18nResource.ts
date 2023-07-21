import { equals, cond } from 'ramda';

const getI18nResource = async (brand: string, i18nResourceData: Record<string, never>): Promise<void> => {
    const resourceData = await cond<string, Promise<Record<string, unknown>>>([
        [equals('Anderson'), () => import('./resources/anderson').then(module => module.default)],
        [equals('Mason'), () => import('./resources/mason').then(module => module.default)],
        [equals('Nelson'), () => import('./resources/nelson').then(module => module.default)],
        [equals('Nigel'), () => import('./resources/nigel').then(module => module.default)],
        [equals('Jefferson'), () => import('./resources/jefferson').then(module => module.default)],
        [equals('Washington'), () => import('./resources/washington').then(module => module.default)],
        [equals('FrgTech'), () => import('./resources/tech').then(module => module.default)],
    ])(brand);
    Object.assign(i18nResourceData, resourceData);
};

export default getI18nResource;
