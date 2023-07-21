import { useTranslation } from 'react-i18next';

export const formatDateDDMon = (lastModified: string): string => {
    const { t } = useTranslation();

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const date = new Date(lastModified);
    const month = date.getMonth();
    const day = date.getDate();

    return `${day} ${t(months[month])}`;
};
