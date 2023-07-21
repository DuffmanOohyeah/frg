import { includes, forEach } from 'ramda';

export const addOnclickToDropdown = (blogContentPage): Array<HTMLElement> => {
    if (blogContentPage.current) {
        const toggleSpoilerVisibility = (spoiler): void => {
            if (includes('su-spoiler-closed', [...spoiler.classList])) spoiler.classList.remove('su-spoiler-closed');
            else spoiler.classList.add('su-spoiler-closed');
        };
        const spoilers = blogContentPage.current.getElementsByClassName('su-spoiler');
        const spoilerTitles: Array<HTMLElement> = [];
        for (let spoilersIndex = 0; spoilersIndex < spoilers.length; spoilersIndex++) {
            const spoiler = spoilers[spoilersIndex];
            const spoilerButton = spoiler.firstElementChild;
            if (spoilerButton instanceof HTMLElement) {
                if (spoilerButton.classList.contains('su-spoiler-title')) {
                    spoilerButton.onclick = (): void => toggleSpoilerVisibility(spoiler);
                    spoilerButton.onkeypress = (e): void => {
                        if (e.keyCode == 13) toggleSpoilerVisibility(spoiler);
                    };
                } else {
                    console.error(`first child does not have class - su-spoiler-title`);
                }
                spoilerTitles.push(spoilerButton);
            } else {
                console.error(`${spoilerButton} is not a HTMLElement`);
            }
        }
        return spoilerTitles;
    }
    return [];
};

export const cleanUpOnClicks = (spoilerTitles: Array<HTMLElement>): void => {
    forEach(spoilerButton => {
        spoilerButton.onclick = null;
        spoilerButton.onkeypress = null;
    }, spoilerTitles);
};
