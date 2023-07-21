import { pipe } from 'ramda';
import capitaliseWord from './capitaliseWord';

const capitaliseSentence = pipe(
    sentence => sentence?.split('-'),
    words => words?.map(capitaliseWord),
    words => words?.join(' '),
);

export default capitaliseSentence;
