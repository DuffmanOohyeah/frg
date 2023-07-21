import { subDays, isAfter } from 'date-fns';

const isWithinXDaysAgo = (date: string, days: number): boolean => {
    const daysFromToday = subDays(new Date(), days);
    const compareToDate = new Date(date);
    const result = isAfter(compareToDate, daysFromToday);
    return result;
};

export default isWithinXDaysAgo;
