import { cond, equals, always } from 'ramda';

const getHeadTitle = cond<string, string>([
    [equals('Anderson'), always('Anderson Frank | Experts In NetSuite Recruitment')],
    [equals('Mason'), always('Salesforce Jobs: Find your #DreamJob with Mason Frank International')],
    [equals('Nelson'), always('Experts in ServiceNow Recruitment | Nelson Frank')],
    [equals('Nigel'), always('Microsoft Recruitment | Microsoft Careers & Jobs | Nigel Frank')],
    [equals('Jefferson'), always('Global experts in AWS recruitment | Jefferson Frank')],
    [equals('Washington'), always('World-beating ERP recruitment | Washington Frank')],
    [equals('FrgTech'), always('FRG Technology Consulting | IT & MarTech Recruitment Experts')],
]);

export default getHeadTitle;
