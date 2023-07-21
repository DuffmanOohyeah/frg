import map from 'ramda/src/map';
import addIndex from 'ramda/src/addIndex';

type IndexMapFn<T, O> = (item: T, index: number, list?: T[]) => O;
type MapIndexedPartial1<T, O> = (b: readonly T[]) => O[];

// Because of currying, mapIndexed has two signatures, one where we
// just pass a function, one where we pass a function and an array. We
// declare those signatures here
function mapIndexed<T, O>(a: IndexMapFn<T, O>, b: readonly T[]): O[];
function mapIndexed<T, O>(a: IndexMapFn<T, O>): MapIndexedPartial1<T, O>;

// We then come to our implementation. Typescript forces us to have
// just one implementation that handles all signatures, so we need
// type guards to work out which signature is in use at runtime. In
// our case, this is straightforward as we just work out if the second
// argument is given.
function mapIndexed<T, O>(a: IndexMapFn<T, O>, b?: readonly T[]): O[] | MapIndexedPartial1<T, O> {
    if (typeof b === 'undefined') {
        return addIndex<T, O>(map)(a);
    }
    return addIndex<T, O>(map)(a, b);
}

export default mapIndexed;
