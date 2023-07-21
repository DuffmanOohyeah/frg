import { generatedJobSearchFilterBy } from '../brands/getVanityUrls/getJobVanityUrls';

const findGeneratedJobSearchUrl = (path: string) => (generatedJobSearchPrefix: string): boolean | undefined => {
    if (!path || !generatedJobSearchPrefix) return undefined;
    return path.startsWith(generatedJobSearchPrefix) && path.includes(generatedJobSearchFilterBy);
};

export default findGeneratedJobSearchUrl;
