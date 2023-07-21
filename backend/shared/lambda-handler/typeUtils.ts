import * as t from 'io-ts';
import { nonEmptyArray } from 'io-ts-types/lib/nonEmptyArray';
import { isRight } from 'fp-ts/lib/Either';

export const fromNullable = <A, O>(typ: t.Type<A, O, unknown>, defaultValue: A): t.Type<A, O, unknown> => {
    return new t.Type<A, O, unknown>(
        'fromNullable(${typ.name})',
        /* istanbul ignore next */
        (u): u is A => typ.is(u),
        (u, c) => {
            if (u == null) {
                return t.success(defaultValue);
            }
            return typ.validate(u, c);
        },
        /* istanbul ignore next */
        a => typ.encode(a),
    );
};

export const optionalToUndefined = <A, O>(typ: t.Type<A, O, unknown>): t.Type<A | undefined, O | undefined, unknown> => {
    const unioned = t.union([typ, t.undefined]);
    return fromNullable<A | undefined, O | undefined>(unioned, undefined);
};

interface SnsOutput {
    /* eslint-disable @typescript-eslint/naming-convention */
    Records: Array<{
        Sns: {
            Message: string;
        };
    }>;
    /* eslint-enable @typescript-eslint/naming-convention */
}

class SnsType<A> extends t.Type<A, SnsOutput, unknown> {
    readonly name: string;
    readonly sub: t.Type<A>;

    constructor(sub: t.Type<A>) {
        const subDecode = sub.decode.bind(sub);
        const subEncode = sub.encode.bind(sub);
        super(
            'Sns',
            sub.is,
            (i: unknown, context: t.Context): t.Validation<A> => {
                const snsCodec = t.type({
                    Records: nonEmptyArray(
                        t.type({
                            Sns: t.type({
                                Message: t.string,
                            }),
                        }),
                    ),
                });
                const v = snsCodec.validate(i, context);
                if (isRight(v)) {
                    const jsonString = v.right.Records[0].Sns.Message;
                    let json;
                    try {
                        json = JSON.parse(jsonString);
                    } catch (err) {
                        return t.failure<A>(jsonString, context, 'Invalid JSON');
                    }
                    return subDecode(json);
                }
                return v;
            },
            (a: A): SnsOutput => {
                const innerValue = subEncode(a);
                return {
                    Records: [
                        {
                            Sns: {
                                Message: JSON.stringify(innerValue),
                            },
                        },
                    ],
                };
            },
        );
    }
}

export const snsType = <A>(sub: t.Type<A>): t.Type<A, SnsOutput> => new SnsType(sub);

export const always = <T extends t.Mixed>(type: T, value: t.TypeOf<T>): t.Type<t.TypeOf<T>, t.TypeOf<T>, unknown> => {
    return new t.Type(`always(${type.name}, ${JSON.stringify(value)})`, type.is, () => type.decode(value), type.encode);
};
