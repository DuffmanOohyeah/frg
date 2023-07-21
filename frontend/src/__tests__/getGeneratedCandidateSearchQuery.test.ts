import getGeneratedCandidateSearchQuery from '../utils/getGeneratedCandidateSearchQuery';

describe('getGeneratedCandidateSearchQuery', () => {
    describe('when passed no props', () => {
        it('returns an empty object', () => {
            const result = getGeneratedCandidateSearchQuery('Jefferson');

            expect(result).toEqual({});
        });
    });

    describe('when passed an empty string', () => {
        it('returns an empty object', () => {
            const result = getGeneratedCandidateSearchQuery('Jefferson', '');

            expect(result).toEqual({});
        });
    });

    describe('when passed a location', () => {
        it('returns an object with a location prop', () => {
            const result = getGeneratedCandidateSearchQuery('Jefferson', '-in-united-kingdom');

            expect(result).toEqual({
                location: 'United Kingdom',
            });
        });
    });

    describe('when passed a skill', () => {
        it('returns an object with a skills array with a skill', () => {
            const result = getGeneratedCandidateSearchQuery('Jefferson', '-with-react-experience');

            expect(result).toEqual({
                skills: ['React'],
            });
        });
    });

    describe('when passed a location and a skill', () => {
        it('returns an object with a skills array with a skill, and a location prop', () => {
            expect(getGeneratedCandidateSearchQuery('Jefferson', '-in-united-kingdom-with-react-experience')).toEqual({
                skills: ['React'],
                location: 'United Kingdom',
            });

            expect(getGeneratedCandidateSearchQuery('Jefferson', '-with-react-experience-in-united-kingdom')).toEqual({
                skills: ['React'],
                location: 'United Kingdom',
            });
        });
    });
});
