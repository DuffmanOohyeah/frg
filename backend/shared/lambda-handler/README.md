# lambda-handler

A mini-framework for handling things that match the following pattern:

- Are run on AWS Lambda
- Receive a range of different events
- Handle those events in different ways
- Perform runtime type-checking on those events

## Example

```typescript
import { handlerFactory } from '../index';

import * as t from 'io-ts';

const SimpleEvent = t.type({
    field: t.string,
    args: t.unknown,
});

type SimpleEvent = t.TypeOf<typeof SimpleEvent>;

interface Context {
    name: string;
}

const SimpleInput = t.type({
    field: t.literal('myField'),
    args: t.type({
        num: t.number,
    }),
});

type SimpleInput = t.TypeOf<typeof SimpleInput>;

interface SimpleOutput {
    str: string;
    ctx: Context;
}


const handler = handlerFactory({
    eventDecoder: SimpleEvent,
    getContext: async (event: SimpleEvent): Promise<Context> => Promise.resolve({
        name: event.field,
    }),
    getResolverName: (event: SimpleEvent): string => event.field,
    resolvers: {
        myField: {
            inputCodec: SimpleInput,
            fn: async (input: SimpleInput, context: Context): Promise<SimpleOutput> => {
                return Promise.resolve({
                    str: `Your number is ${input.args.num}`,
                    ctx: context,
                });
            },
        },
    },
});

module.exports = { handler }
```

### `handlerFactory` arguments

- `eventDecoder` - this is used to decode the event, so that we can determine which resolver to use.
- `getContext` - this is passed the event and returns some shared context for the resolver.
- `getResolverName` - this is passed the event and returns the identifier for the resolver to use.
- `resolvers` - an object of `ResolverProps` objects, keyed by their identifier

### `ResolverProps`

- `inputCodec` - this is an `io-ts` decoder that takes `unknown` and returns the `Input` type for this resolver
- `fn` - this takes the `Input` type for this resolver, and the context, and returns a promise of the `Output` type

Then, invoking with a function with something like
```typescript
{
    field: 'myField',
    args: {
        num: 123,
    },
}
```
will result in
```typescript
{
    str: 'Your number is 123',
    ctx: {
        name: 'myField',
    },
}
```

# `typeUtils`

There are also some utilities for handling types.

## `optionalToUndefined`

Given a type, returns a type that accepts that type, but also accepts
`null` and `undefined`, but will always output that type or
`undefined`.

## `snsType`

Given a type, returns a type that will accept an SNS-ified version of
that type, but will output the original type. That is, it will unpack
the SNS wrapper and parse the JSON, generating errors if either the
wrapper doesn't match the expect shape for SNS, or if the JSON doesn't
match the passed type.

## `always`

Given a type and a value, always outputs the value, regardless of what
is in the given object.
