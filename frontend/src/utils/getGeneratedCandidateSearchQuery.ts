import { pipe, equals, cond, always, toLower } from 'ramda';
import { SearchCandidatesQuery } from '../queries';
import capitaliseSentence from './capitaliseSentence';

const getLocation = pipe(
    url => url?.split('-in-')[1],
    url => url?.split('-with-')[0],
    location => capitaliseSentence(location),
);

const getSkill = pipe(
    url => url?.split('-with-')[1],
    url => url?.split('-in-')[0],
    url => url?.split('-experience')[0],
    skill => skill && capitaliseSentence(skill),
);

const getTechDisplay = cond<string, string>([
    [equals('Anderson'), always('NetSuite')],
    [equals('Mason'), always('Salesforce')],
    [equals('Nelson'), always('ServiceNow')],
    [equals('Nigel'), always('Microsoft')],
    [equals('Jefferson'), always('AWS')],
    [equals('Washington'), always('ERP')],
    [equals('FrgTech'), always('Tech')],
]);

const getBrandDisplay = cond<string, string>([
    [equals('Anderson'), always('Anderson Frank')],
    [equals('Mason'), always('Mason Frank')],
    [equals('Nelson'), always('Nelson Frank')],
    [equals('Nigel'), always('Nigel Frank')],
    [equals('Jefferson'), always('Jefferson Frank')],
    [equals('Washington'), always('Washington Frank')],
    [equals('FrgTech'), always('FRG Technology Consulting')],
]);

const andersonSkillsMap = {
    sql: 'SQL',
    sap: 'SAP',
};

const masonSkillsMap = {
    html: 'HTML',
    sql: 'SQL',
    'javascript and dhtml': 'JavaScript/DHTML',
    rest: 'REST',
    'oracle jde': 'Oracle JDE',
    mulesoft: 'MuleSoft',
    'oracle bi': 'Oracle BI',
    etl: 'ETL',
    'integration cloud mulesoft': 'Integration Cloud MuleSoft',
    'cpq apptus': 'CPQ Apptus',
    'cpq steelbrick': 'CPQ Steelbrick',
    'commerce cloud demandware cloudcraze': 'Commerce Cloud Demandware CloudCraze',
};

interface SkillMap {
    [skill: string]: string;
}

const getSkillsMap = cond<string, SkillMap>([
    [equals('Anderson'), always(andersonSkillsMap)],
    [equals('Mason'), always(masonSkillsMap)],
    [equals('Nelson'), always({})],
    [equals('Nigel'), always({})],
    [equals('Jefferson'), always({})],
    [equals('Washington'), always({})],
    [equals('FrgTech'), always({})],
]);

interface Meta {
    title: string;
    description: string;
}

export const getGeneratedCandidateSearchMeta = (brand: string, path?: string): Meta | undefined => {
    const location = getLocation(path);
    const baseSkill = getSkill(path);
    const skill = (baseSkill && getSkillsMap(brand)[toLower(baseSkill)]) || baseSkill;
    const product = getTechDisplay(brand);
    const brandDisplay = getBrandDisplay(brand);

    if (skill) {
        return {
            title: `Hire ${skill} Professionals | ${brandDisplay}`,
            // eslint-disable-next-line max-len
            description: `Find the latest ${skill} professionals with ${brandDisplay}, the ${skill} recruitment agency of choice. Search and shortlist ${product} pros today.`,
        };
    }

    if (location) {
        return {
            title: `Hire ${product} Professionals in ${location} | ${brandDisplay}`,
            // eslint-disable-next-line max-len
            description: `Find top ${product} professionals in ${location} with ${brandDisplay}, the ${product} recruitment agency of choice. Search and shortlist ${product} pros today.`,
        };
    }
};

const getGeneratedCandidateSearchQuery = (brand: string, path?: string): Partial<SearchCandidatesQuery> => {
    const location = getLocation(path);
    const baseSkill = getSkill(path);
    const skill = (baseSkill && getSkillsMap(brand)[toLower(baseSkill)]) || baseSkill;
    const searchQuery: Partial<SearchCandidatesQuery> = {};

    if (location) searchQuery.location = location;
    if (skill) searchQuery.skills = [skill];

    return searchQuery;
};

export default getGeneratedCandidateSearchQuery;
