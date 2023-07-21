import { cond, equals, always, T, F } from 'ramda';

const stringToBoolean = cond<string, boolean | undefined>([
    [equals('true'), T],
    [equals('false'), F],
    [T, always(undefined)],
]);

export default stringToBoolean;
