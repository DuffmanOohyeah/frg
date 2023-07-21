import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
export * from './typeUtils';

export interface ResolverProps<C, I, O> {
    inputCodec: t.Decoder<unknown, I>;
    fn: (input: I, context: C) => Promise<O>;
}

interface Resolvers<C> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: ResolverProps<C, any, unknown>;
}

interface HandlerProps<C, E> {
    resolvers: Resolvers<C>;
    eventDecoder: t.Decoder<unknown, E>;
    getContext: (event: E) => Promise<C>;
    getResolverName: (event: E) => string;
}

const runResolver = async <C, I, O>(resolver: ResolverProps<C, I, O>, event: I, context: C): Promise<O> => {
    const parsedEvent = resolver.inputCodec.decode(event);
    if (!isRight(parsedEvent)) {
        return Promise.reject('Input data is the wrong shape');
    }
    const typedEvent = parsedEvent.right;
    return await resolver.fn(typedEvent, context);
};

export const handlerFactory = <C, E>(props: HandlerProps<C, E>) => async (rawEvent: unknown = undefined): Promise<unknown> => {
    const parsedEvent = props.eventDecoder.decode(rawEvent);
    if (!isRight(parsedEvent)) {
        return Promise.reject('Event incorrect shape');
    }

    const event = parsedEvent.right;

    const context = await props.getContext(event);
    const resolverIdentifier = props.getResolverName(event);
    const resolver = props.resolvers[resolverIdentifier];
    if (typeof resolver === 'undefined') {
        return Promise.reject('Unknown resolver');
    }

    return await runResolver(resolver, event, context);
};
