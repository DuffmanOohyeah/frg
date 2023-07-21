import { SearchJobSalary } from '../queries';
import formatNumber, { FormatNumberProps } from './formatNumber';

const makeSalaryString = (salary: SearchJobSalary, language: string): string => {
    if (salary.currency) {
        let salaryFrom = '';
        let salaryTo = '';

        const formatArgs: FormatNumberProps = {
            value: 0,
            options: {
                currency: salary.currency,
                currencyDisplay: 'symbol',
                style: 'currency',
            },
            language,
        };

        if (salary.from) {
            formatArgs.value = salary.from;
            salaryFrom = formatNumber(formatArgs);
        }
        if (salary.to) {
            formatArgs.value = salary.to;
            salaryTo = formatNumber(formatArgs);
        }

        if (salary.from && salary.to) return `${salaryFrom} to ${salaryTo} ${salary.currency}`;
        if (!salary.from && salary.to) return `Up to ${salaryTo} ${salary.currency}`;
        if (salary.from && !salary.to) return `From ${salaryFrom}  ${salary.currency}`;
        if (salary.description) return salary.description;
    }

    return '';
};

export default makeSalaryString;
