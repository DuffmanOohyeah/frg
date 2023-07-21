import isWithinXDaysAgo from '../utils/isWithinXDaysAgo';
import { subDays } from 'date-fns';

describe('isWithinXDaysAgo', () => {
    test('should return false if string is more than x days ago', async () => {
        const dateToCompare = subDays(new Date(), 20).toString();
        const result = isWithinXDaysAgo(dateToCompare, 14);
        expect(result).toEqual(false);
    });
    test('should return true if string is less than x days ago', async () => {
        const dateToCompare = subDays(new Date(), 5).toString();
        const result = isWithinXDaysAgo(dateToCompare, 14);
        expect(result).toEqual(true);
    });
});
