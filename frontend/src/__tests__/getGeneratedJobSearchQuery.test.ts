import capitaliseSentence from '../utils/capitaliseSentence';
import getGeneratedJobSearchQuery from '../utils/generatedJobSearch/getGeneratedJobSearchQuery';
import { roles } from '../utils/generatedJobSearch/utils';

describe('getGeneratedJobSearchQuery', () => {
    describe('when passed an empty string', () => {
        it('returns an object with the most basic generic metadata, and remote as false', () => {
            expect(getGeneratedJobSearchQuery('Jefferson', '')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: undefined,
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: undefined,
            });
        });
    });

    describe('when passed an string with a role', () => {
        it('returns an object with an uppercased role, a title with the role mentioned, and remote as false', () => {
            roles('Jefferson').map(role => {
                const resultJefferson = getGeneratedJobSearchQuery('Jefferson', `/${role}-jobs`);
                if (role === 'devops') {
                    expect(resultJefferson).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: ['DevOps'],
                    });
                } else if (role === 'sysops') {
                    expect(resultJefferson).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: ['SysOps'],
                    });
                } else {
                    expect(resultJefferson).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: [capitaliseSentence(role)],
                    });
                }
            });

            roles('FrgTech').map(role => {
                const resultFrgTech = getGeneratedJobSearchQuery('FrgTech', `/${role}-jobs`);
                if (role === 'devops') {
                    expect(resultFrgTech).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: ['DevOps'],
                    });
                } else if (role === 'sysops') {
                    expect(resultFrgTech).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: ['SysOps'],
                    });
                } else if (role === 'support-engineer') {
                    expect(resultFrgTech).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: ['Support Engineer', 'Support', 'Engineer'],
                    });
                } else if (role === 'business-analyst') {
                    expect(resultFrgTech).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: ['Business Analyst', 'Analyst'],
                    });
                } else if (role === 'digital-project-manager') {
                    expect(resultFrgTech).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: ['Digital Project Manager', 'Manager'],
                    });
                } else if (role === 'solution-architect') {
                    expect(resultFrgTech).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: ['Solution Architect', 'Architect'],
                    });
                } else {
                    expect(resultFrgTech).toEqual({
                        remote: false,
                        jobType: undefined,
                        location: undefined,
                        role: [capitaliseSentence(role)],
                    });
                }
            });
        });
    });

    describe('when passed a location', () => {
        it('returns an object with a location, and a location mentioned in the title and description', () => {
            expect(getGeneratedJobSearchQuery('Jefferson', '/aws-jobs-in-united-kingdom')).toEqual({
                remote: false,
                jobType: undefined,
                location: 'United Kingdom',
                role: undefined,
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/aws-jobs-in-united-kingdom')).toEqual({
                remote: false,
                jobType: undefined,
                location: 'United Kingdom',
                role: undefined,
            });
        });
    });

    describe('when passed an empty location', () => {
        it('returns an object without a location', () => {
            expect(getGeneratedJobSearchQuery('Jefferson', '/aws-jobs-in-')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: undefined,
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/aws-jobs-in-')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: undefined,
            });
        });
    });

    describe('when passed "remote"', () => {
        it('returns remote as true', () => {
            expect(getGeneratedJobSearchQuery('Jefferson', '/remote-jobs')).toEqual({
                remote: true,
                jobType: undefined,
                location: undefined,
                role: undefined,
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/remote-jobs')).toEqual({
                remote: true,
                jobType: undefined,
                location: undefined,
                role: undefined,
            });
        });
    });

    describe('when passed "contract"', () => {
        it('returns Contract as the jobType', () => {
            expect(getGeneratedJobSearchQuery('Jefferson', '/contract-jobs')).toEqual({
                remote: false,
                jobType: 'Contract',
                location: undefined,
                role: undefined,
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/contract-jobs')).toEqual({
                remote: false,
                jobType: 'Contract',
                location: undefined,
                role: undefined,
            });
        });
    });

    describe('when passed "permanent"', () => {
        it('returns Permanent as the jobType', () => {
            expect(getGeneratedJobSearchQuery('Jefferson', '/permanent-jobs')).toEqual({
                remote: false,
                jobType: 'Permanent',
                location: undefined,
                role: undefined,
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/permanent-jobs')).toEqual({
                remote: false,
                jobType: 'Permanent',
                location: undefined,
                role: undefined,
            });
        });
    });

    describe('when passed a string with a location, jobType, remote, and a role', () => {
        it('returns the location, remote as true, role, and Permanent as jobType', () => {
            expect(getGeneratedJobSearchQuery('Jefferson', '/remote-aws-permanent-executive-in-york')).toEqual({
                remote: true,
                jobType: 'Permanent',
                location: 'York',
                role: ['Executive'],
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/remote-aws-permanent-executive-in-york')).toEqual({
                remote: true,
                jobType: 'Permanent',
                location: 'York',
                role: ['Executive'],
            });
        });
    });

    describe('when passed a string with a location, jobType, remote, and two roles', () => {
        it('returns Permanent as the jobType and two roles', () => {
            expect(
                getGeneratedJobSearchQuery('Jefferson', '/remote-aws-permanent-developer-engineer-jobs-in-york'),
            ).toEqual({
                remote: true,
                jobType: 'Permanent',
                location: 'York',
                role: ['Developer', 'Engineer'],
            });

            expect(
                getGeneratedJobSearchQuery('FrgTech', '/remote-aws-permanent-developer-engineer-jobs-in-york'),
            ).toEqual({
                remote: true,
                jobType: 'Permanent',
                location: 'York',
                role: ['Developer', 'Engineer'],
            });
        });
    });

    describe('when prefix has possible overlaps with role', () => {
        it('only returns the role when role is included', () => {
            expect(getGeneratedJobSearchQuery('Mason', '/salesforce-sales-jobs')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: ['Sales'],
            });

            expect(getGeneratedJobSearchQuery('Mason', '/salesforce-developer-jobs')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: ['Developer'],
            });

            expect(getGeneratedJobSearchQuery('Mason', '/salesforce-jobs')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: undefined,
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/mi-administrator-jobs')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: ['Administrator'],
            });
        });
    });

    describe('when brand has multiple possible prefixes, e.g. FrgTech', () => {
        it('returns roles that are both a prefix name and a role name', () => {
            expect(getGeneratedJobSearchQuery('FrgTech', '/big-data-data-science-jobs')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: ['Data Science', 'Big Data'],
            });
        });

        it('returns roles with no overlap with the prefix name', () => {
            expect(getGeneratedJobSearchQuery('FrgTech', '/heroku-architect-permanent-jobs-in-amsterdam')).toEqual({
                remote: false,
                jobType: 'Permanent',
                location: 'Amsterdam',
                role: ['Architect'],
            });
        });
    });

    describe('when passed invalid values for any of prefixes, roles, job types or locations', () => {
        it('ignores anything that is not a role or a valid prefix', () => {
            expect(getGeneratedJobSearchQuery('FrgTech', '/aws-blah-blah-blah-manager-contract-jobs')).toEqual({
                remote: false,
                jobType: 'Contract',
                location: undefined,
                role: ['Manager'],
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/blah-blah-devops-jobs')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: ['DevOps'],
            });

            expect(getGeneratedJobSearchQuery('FrgTech', '/blah-jobs')).toEqual({
                remote: false,
                jobType: undefined,
                location: undefined,
                role: undefined,
            });
        });
    });
});
