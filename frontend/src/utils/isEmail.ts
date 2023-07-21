import { allPass, both, countBy, gte, identity, init, join, last, pipe, prop, split, __ } from 'ramda';

// exported for test
export const containsAtLeastOneAtSymbol = pipe(split(''), countBy(identity), prop<string, number>('@'), gte(__, 1));

// exported for test
export const atLeastOneCharBeforeAtSymbol = both(
    containsAtLeastOneAtSymbol,
    pipe(
        split('@'),
        // All but the last element, incase there are multiple @s
        x => init<string>(x),
        join(''),
        // Cause technically ramda's length only works on arrays and not string
        // and @types/ramda chooses to follow the docs
        x => x.length,
        gte(__, 1),
    ),
);

// exported for test
export const atLeastOneCharAfterAtSymbol = both(
    containsAtLeastOneAtSymbol,
    pipe(split('@'), last, (x: string) => x.length, gte(__, 1)),
);

// phoenix errors if the email is longer than 80
const lengthLessThan80 = email => email.length < 80;

export const isValidEmail = email => {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return pattern.test(email);
};

const isEmail = allPass([
    containsAtLeastOneAtSymbol,
    atLeastOneCharBeforeAtSymbol,
    atLeastOneCharAfterAtSymbol,
    lengthLessThan80,
]);

export default isEmail;
