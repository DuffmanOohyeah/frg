import * as path from 'path';
import * as fs from 'fs';
import * as R from 'ramda';

import { Synonyms, mergeSynonymCollections, EMPTY_SYNONYM_COLLECTIONS, OUTPUT_DIR } from './loaders/common';
import { skillsAndAliases } from './loaders/skillsAndAliases';
import { geoNames } from './loaders/geoNames';

const formatSynonymsFile = (synonyms: Synonyms): string => {
    const rows: Array<string> = R.values(
        R.mapObjIndexed((alternatives: Set<string>, main: string): string => {
            return `${main}, ${Array.from(alternatives).join(', ')}`;
        }, synonyms),
    );
    return rows.join('\n') + '\n';
};

export const main = async (): Promise<void> => {
    const collections = await Promise.all([skillsAndAliases(), geoNames()]);

    const merged = R.reduce(mergeSynonymCollections, EMPTY_SYNONYM_COLLECTIONS, collections);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    fs.writeFileSync(path.join(OUTPUT_DIR, 'skills.txt'), formatSynonymsFile(merged.skills));
    fs.writeFileSync(path.join(OUTPUT_DIR, 'products.txt'), formatSynonymsFile(merged.products));
    fs.writeFileSync(path.join(OUTPUT_DIR, 'industries.txt'), formatSynonymsFile(merged.industries));
    fs.writeFileSync(path.join(OUTPUT_DIR, 'jobTitles.txt'), formatSynonymsFile(merged.jobTitles));
};
