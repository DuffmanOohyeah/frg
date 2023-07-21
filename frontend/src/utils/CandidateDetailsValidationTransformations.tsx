/* eslint-disable @typescript-eslint/explicit-function-return-type */
import isEmail from './isEmail';
import { validPassword } from '../components/patterns/FormFields/PasswordField/passwordUtils';

export const candidateDetailsValidationTransformations = {
    email: (x: string): string | undefined => (isEmail(x) ? undefined : 'Please enter a valid email address'),
    firstName: (x: string): string | undefined => (x.length ? undefined : 'Please enter your first name'),
    lastName: (x: string): string | undefined => (x.length ? undefined : 'Please enter your last name'),
    password: (x: string): string | undefined => (validPassword(x) ? undefined : 'Please enter a valid password'),
};
