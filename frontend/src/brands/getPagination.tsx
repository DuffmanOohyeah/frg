import React from 'react';
import getDomain from './getDomain';
import frgI18n from './../i18n/frgI18n';

const getPagination = (page: number, value: number, brand: string): JSX.Element[] => {
    const router = frgI18n.useRouter();
    const pathname = router.pathname;
    const path = pathname === '/[...path]' ? router.asPath : pathname;
    const domain = getDomain(brand);
    const pagination: JSX.Element[] = [];

    if (page) {
        if (page > 1) {
            // prev page
            pagination.push(<link rel="prev" href={`https://www.${domain}.com${path}?page=${page - 1}`} />);
        }
        const pages = Math.ceil(value / 10);
        if (page < pages) {
            // next page
            pagination.push(<link rel="next" href={`https://www.${domain}.com${path}?page=${page + 1}`} />);
        }
    }
    return pagination;
};

export default getPagination;
