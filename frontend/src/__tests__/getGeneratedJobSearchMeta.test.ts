import getGeneratedJobSearchMeta from '../utils/generatedJobSearch/getGeneratedJobSearchMeta';
import { roles, frgTechBrandAcronyms, formatPrefixRegex } from '../utils/generatedJobSearch/utils';
import { generatedJobSearchPrefixs } from '../brands/getVanityUrls/getJobVanityUrls';
import capitaliseSentence from '../utils/capitaliseSentence';
import { JobType } from '../types';

describe('getGeneratedJobSearchMeta', () => {
    describe('when passed a string which includes a prefix', () => {
        it('Jefferson - returns a title that includes the prefix', () => {
            generatedJobSearchPrefixs('Jefferson').map(prefix => {
                const resultJefferson = getGeneratedJobSearchMeta('Jefferson', `${prefix}-jobs`);

                if (prefix === '/aws') {
                    expect(resultJefferson).toEqual({
                        title: 'AWS Jobs | Jefferson Frank',
                        description: 'Find and apply for your dream job at Jefferson Frank',
                    });
                } else if (prefix === '/devops') {
                    expect(resultJefferson).toEqual({
                        title: 'AWS DevOps Jobs | Jefferson Frank',
                        description: 'Find and apply for your dream job at Jefferson Frank',
                    });
                } else {
                    expect(resultJefferson).toEqual({
                        title: `${capitaliseSentence(prefix.substr(1))} AWS Jobs | Jefferson Frank`,
                        description: 'Find and apply for your dream job at Jefferson Frank',
                    });
                }
            });
        });

        it('Nelson - returns a title that includes the prefix', () => {
            generatedJobSearchPrefixs('Nelson').map(prefix => {
                const resultNelson = getGeneratedJobSearchMeta('Nelson', `${prefix}-jobs`);

                if (prefix === '/servicenow') {
                    expect(resultNelson).toEqual({
                        title: 'ServiceNow Jobs | Nelson Frank',
                        description: 'Find and apply for your dream job at Nelson Frank',
                    });
                } else if (prefix === '/remote') {
                    expect(resultNelson).toEqual({
                        title: 'Remote ServiceNow Jobs | Nelson Frank',
                        description: 'Find and apply for your dream job at Nelson Frank',
                    });
                }
            });
        });
        it('FrgTech - returns a title that includes the prefix', () => {
            generatedJobSearchPrefixs('FrgTech').map(prefix => {
                const resultFrgTech = getGeneratedJobSearchMeta('FrgTech', `${prefix}-jobs`);
                const formattedPrefix = prefix.replace(formatPrefixRegex, '');

                if (prefix === '/ios-') {
                    expect(resultFrgTech).toEqual({
                        title: 'iOS Jobs | FRG Technology Consulting',
                        description: 'Find and apply for your dream job at FRG Technology Consulting',
                    });
                } else if (frgTechBrandAcronyms.includes(formattedPrefix)) {
                    expect(resultFrgTech).toEqual({
                        title: `${formattedPrefix.toUpperCase()} Jobs | FRG Technology Consulting`,
                        description: 'Find and apply for your dream job at FRG Technology Consulting',
                    });
                } else {
                    expect(resultFrgTech).toEqual({
                        title: `${capitaliseSentence(formattedPrefix)} Jobs | FRG Technology Consulting`,
                        description: 'Find and apply for your dream job at FRG Technology Consulting',
                    });
                }
            });
        });
    });

    describe('when passed a string which includes only a role', () => {
        it('returns a title that includes the role', () => {
            roles('Jefferson').map(role => {
                const resultJefferson = getGeneratedJobSearchMeta('Jefferson', `/${role}-jobs`);

                if (role === 'devops') {
                    expect(resultJefferson).toEqual({
                        title: 'AWS DevOps Jobs | Jefferson Frank',
                        description: 'Find and apply for your dream job at Jefferson Frank',
                    });
                } else if (role === 'sysops') {
                    expect(resultJefferson).toEqual({
                        title: 'AWS SysOps Jobs | Jefferson Frank',
                        description: 'Find and apply for your dream job at Jefferson Frank',
                    });
                } else {
                    expect(resultJefferson).toEqual({
                        title: `AWS ${capitaliseSentence(role)} Jobs | Jefferson Frank`,
                        description: 'Find and apply for your dream job at Jefferson Frank',
                    });
                }
            });

            roles('Nelson').map(role => {
                const resultNelson = getGeneratedJobSearchMeta('Nelson', `/${role}-jobs`);

                if (role === 'dba') {
                    expect(resultNelson).toEqual({
                        title: 'ServiceNow DBA Jobs | Nelson Frank',
                        description: 'Find and apply for your dream job at Nelson Frank',
                    });
                } else {
                    expect(resultNelson).toEqual({
                        title: `ServiceNow ${capitaliseSentence(role)} Jobs | Nelson Frank`,
                        description: 'Find and apply for your dream job at Nelson Frank',
                    });
                }
            });

            roles('FrgTech').map(role => {
                const resultFrgTech = getGeneratedJobSearchMeta('FrgTech', `/${role}-jobs`);

                if (role === 'sysops') {
                    expect(resultFrgTech).toEqual({
                        title: 'SysOps Jobs | FRG Technology Consulting',
                        description: 'Find and apply for your dream job at FRG Technology Consulting',
                    });
                } else if (role === 'devops') {
                    expect(resultFrgTech).toEqual({
                        title: 'DevOps Jobs | FRG Technology Consulting',
                        description: 'Find and apply for your dream job at FRG Technology Consulting',
                    });
                } else {
                    expect(resultFrgTech).toEqual({
                        title: `${capitaliseSentence(role)} Jobs | FRG Technology Consulting`,
                        description: 'Find and apply for your dream job at FRG Technology Consulting',
                    });
                }
            });
        });
    });

    describe('when passed a string which includes Permanent', () => {
        it('returns a title and description that includes Permanent', () => {
            const resultJefferson = getGeneratedJobSearchMeta('Jefferson', `/${JobType.Permanent}-jobs`);

            expect(resultJefferson).toEqual({
                title: 'AWS Permanent Jobs | Jefferson Frank',
                description: 'Find and apply for your dream permanent job at Jefferson Frank',
            });

            const resultNelson = getGeneratedJobSearchMeta('Nelson', `/${JobType.Permanent}-jobs`);

            expect(resultNelson).toEqual({
                title: 'ServiceNow Permanent Jobs | Nelson Frank',
                description: 'Find and apply for your dream permanent job at Nelson Frank',
            });

            const resultFrgTech = getGeneratedJobSearchMeta('FrgTech', `/${JobType.Permanent}-jobs`);

            expect(resultFrgTech).toEqual({
                title: 'Permanent Jobs | FRG Technology Consulting',
                description: 'Find and apply for your dream permanent job at FRG Technology Consulting',
            });
        });
    });

    describe('when passed a string which includes Contract', () => {
        it('returns a title and description that includes Contract', () => {
            const resultJefferson = getGeneratedJobSearchMeta('Jefferson', `/${JobType.Contract}-jobs`);

            expect(resultJefferson).toEqual({
                title: 'AWS Contract Jobs | Jefferson Frank',
                description: 'Find and apply for your dream contract job at Jefferson Frank',
            });

            const resultNelson = getGeneratedJobSearchMeta('Nelson', `/${JobType.Contract}-jobs`);

            expect(resultNelson).toEqual({
                title: 'ServiceNow Contract Jobs | Nelson Frank',
                description: 'Find and apply for your dream contract job at Nelson Frank',
            });

            const resultFrgTech = getGeneratedJobSearchMeta('FrgTech', `/${JobType.Contract}-jobs`);

            expect(resultFrgTech).toEqual({
                title: 'Contract Jobs | FRG Technology Consulting',
                description: 'Find and apply for your dream contract job at FRG Technology Consulting',
            });
        });
    });

    describe('when passed a string which does not specify contract or permanent', () => {
        it('returns a basic title and description', () => {
            const resultJefferson = getGeneratedJobSearchMeta('Jefferson', '/');
            expect(resultJefferson).toEqual({
                title: 'AWS Jobs | Jefferson Frank',
                description: 'Find and apply for your dream job at Jefferson Frank',
            });

            const resultNelson = getGeneratedJobSearchMeta('Nelson', '/');
            expect(resultNelson).toEqual({
                title: 'ServiceNow Jobs | Nelson Frank',
                description: 'Find and apply for your dream job at Nelson Frank',
            });

            const resultFrgTech = getGeneratedJobSearchMeta('FrgTech', '/');
            expect(resultFrgTech).toEqual({
                title: 'Jobs | FRG Technology Consulting',
                description: 'Find and apply for your dream job at FRG Technology Consulting',
            });
        });
    });

    describe('when passed a string which includes remote', () => {
        it('returns Remote in the title', () => {
            const resultJeffersonRemotePrefix = getGeneratedJobSearchMeta('Jefferson', '/remote-aws-engineer-jobs');
            expect(resultJeffersonRemotePrefix).toEqual({
                title: 'Remote AWS Engineer Jobs | Jefferson Frank',
                description: 'Find and apply for your dream job at Jefferson Frank',
            });

            const resultJeffersonRemote = getGeneratedJobSearchMeta('Jefferson', '/aws-remote-jobs');
            expect(resultJeffersonRemote).toEqual({
                title: 'Remote AWS Jobs | Jefferson Frank',
                description: 'Find and apply for your dream job at Jefferson Frank',
            });

            const resultNelsonRemotePrefix = getGeneratedJobSearchMeta('Nelson', '/remote-jobs');
            expect(resultNelsonRemotePrefix).toEqual({
                title: 'Remote ServiceNow Jobs | Nelson Frank',
                description: 'Find and apply for your dream job at Nelson Frank',
            });

            const resultNelsonRemote = getGeneratedJobSearchMeta('Nelson', '/servicenow-remote-jobs');
            expect(resultNelsonRemote).toEqual({
                title: 'Remote ServiceNow Jobs | Nelson Frank',
                description: 'Find and apply for your dream job at Nelson Frank',
            });
        });
    });

    describe('when passed a string which includes a location', () => {
        it('returns location in the title', () => {
            const resultJefferson = getGeneratedJobSearchMeta('Jefferson', '/aws-jobs-in-united-kingdom');
            expect(resultJefferson).toEqual({
                title: 'AWS Jobs in United Kingdom | Jefferson Frank',
                description: 'Find and apply for your dream job in United Kingdom at Jefferson Frank',
            });

            const resultNelson = getGeneratedJobSearchMeta('Nelson', '/servicenow-jobs-in-united-kingdom');
            expect(resultNelson).toEqual({
                title: 'ServiceNow Jobs in United Kingdom | Nelson Frank',
                description: 'Find and apply for your dream job in United Kingdom at Nelson Frank',
            });

            const resultFrgTech = getGeneratedJobSearchMeta('FrgTech', '/tech-jobs-in-york');
            expect(resultFrgTech).toEqual({
                title: 'Tech Jobs in York | FRG Technology Consulting',
                description: 'Find and apply for your dream job in York at FRG Technology Consulting',
            });
        });
    });

    describe('when passed a string which includes a location, remote, tech, contract and permanent', () => {
        it('returns title with each of aforementioned, and a description including the job type and location', () => {
            const resultJefferson = getGeneratedJobSearchMeta(
                'Jefferson',
                '/remote-aws-contract-sysops-jobs-in-united-kingdom',
            );
            expect(resultJefferson).toEqual({
                title: 'Remote AWS Contract SysOps Jobs in United Kingdom | Jefferson Frank',
                description: 'Find and apply for your dream contract job in United Kingdom at Jefferson Frank',
            });

            const resultNelson = getGeneratedJobSearchMeta('Nelson', '/remote-aws-contract-dba-jobs-in-united-kingdom');
            expect(resultNelson).toEqual({
                title: 'Remote ServiceNow Contract DBA Jobs in United Kingdom | Nelson Frank',
                description: 'Find and apply for your dream contract job in United Kingdom at Nelson Frank',
            });

            const resultNelson2 = getGeneratedJobSearchMeta(
                'Nelson',
                '/remote-servicenow-contract-dba-jobs-in-united-kingdom',
            );
            expect(resultNelson2).toEqual({
                title: 'Remote ServiceNow Contract DBA Jobs in United Kingdom | Nelson Frank',
                description: 'Find and apply for your dream contract job in United Kingdom at Nelson Frank',
            });

            const resultFrgTech = getGeneratedJobSearchMeta(
                'FrgTech',
                '/oracle-contract-designer-remote-jobs-in-united-kingdom',
            );
            expect(resultFrgTech).toEqual({
                title: 'Remote Oracle Contract Designer Jobs in United Kingdom | FRG Technology Consulting',
                description:
                    'Find and apply for your dream contract job in United Kingdom at FRG Technology Consulting',
            });
        });
    });

    describe('when passed a string where the tech has an overlap with a role name', () => {
        it('returns the tech and role correctly and does not confuse the two', () => {
            const bigDataRoleResult = getGeneratedJobSearchMeta('FrgTech', '/big-data-jobs');
            expect(bigDataRoleResult).toEqual({
                title: 'Big Data Jobs | FRG Technology Consulting',
                description: 'Find and apply for your dream job at FRG Technology Consulting',
            });

            const awsTechBigDataRoleResult = getGeneratedJobSearchMeta('FrgTech', '/aws-big-data-jobs');
            expect(awsTechBigDataRoleResult).toEqual({
                title: 'AWS Big Data Jobs | FRG Technology Consulting',
                description: 'Find and apply for your dream job at FRG Technology Consulting',
            });

            const salesforceTechSalesRoleResult = getGeneratedJobSearchMeta('Mason', '/salesforce-sales-jobs');
            expect(salesforceTechSalesRoleResult).toEqual({
                title: 'Salesforce Sales Jobs | Mason Frank',
                description: 'Find and apply for your dream job at Mason Frank',
            });
        });
    });
});
