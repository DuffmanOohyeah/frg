export const removeSrcset = (html: string): string => {
    return html.replace(/srcset=".*?"/gi, '');
};
