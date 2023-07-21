import * as t from 'io-ts';
import { optionalToUndefined } from '../shared/lambda-handler';

export const tIdentity = t.type({
    sub: t.string,
    username: t.string,
    claims: t.type({
        sub: t.string,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        email_verified: t.boolean,
        'custom:userType': optionalToUndefined(t.string),
        'custom:ssoUserType': optionalToUndefined(t.string),
        email: t.string,
    }),
});

export type Identity = t.TypeOf<typeof tIdentity>;
