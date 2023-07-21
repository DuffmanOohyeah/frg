import { always, cond, equals } from 'ramda';

const shouldShowProductAndSegment = cond<string, boolean>([
    [equals('Anderson'), always(false)],
    [equals('Mason'), always(false)],
    [equals('Nelson'), always(false)],
    [equals('Nigel'), always(true)],
    [equals('Jefferson'), always(false)],
    [equals('Washington'), always(false)],
    [equals('FrgTech'), always(false)],
]);

export default shouldShowProductAndSegment;
