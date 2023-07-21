import { startsWith, endsWith, pipe, slice } from 'ramda';

export const trimSlashes = pipe(
    (str: string): string => (startsWith('/', str) ? slice(1, Infinity, str) : str),
    (str: string): string => (endsWith('/', str) ? slice(0, -1, str) : str),
);
