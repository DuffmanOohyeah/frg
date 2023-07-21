import { pipe, reduce, keys } from 'ramda';

// Note that numeric enums are objects that actually look like { Foo: 0, Bar: 1, 0: 'Foo', 1: 'Bar' }
// and string enums are actually objects that look like { Foo: 'foo', Bar: 'bar'}
// in the case of numeric enums you may get given the string or numeric representation of the enum
function valueToEnum<E>(e: E, v: string | number | undefined): E[keyof E] | undefined {
    if (typeof v === 'undefined') {
        return undefined;
    }

    const enumKey = v as keyof E;
    if (e[enumKey]) {
        return e[enumKey];
    }

    const flippedEnum = pipe(
        keys,
        reduce((acc, key) => ({ ...acc, [e[key]]: key }), {}),
    )(e);
    const flippedEnumKey = flippedEnum[v] as keyof E;

    if (flippedEnumKey) {
        return e[flippedEnumKey];
    }

    return undefined;
}

export default valueToEnum;
