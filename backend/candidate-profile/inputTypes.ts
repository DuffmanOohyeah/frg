import * as t from 'io-ts';
import { optionalToUndefined } from '../shared/lambda-handler';
import { tIdentity } from './Identity';

export const ParseCVInput = t.type({
    filename: t.string,
});

export const ParseCVEvent = t.type({
    field: t.literal('parseCV'),
    args: ParseCVInput,
    identity: tIdentity,
});

export type ParseCVEvent = t.TypeOf<typeof ParseCVEvent>;

export const ParseCVTemporaryInput = t.type({
    filetype: t.string,
    signedGetUrl: t.string,
});

export const ParseCVTemporaryEvent = t.type({
    field: t.literal('parseCVTemporary'),
    args: ParseCVTemporaryInput,
});

export type ParseCVTemporaryEvent = t.TypeOf<typeof ParseCVTemporaryEvent>;

export const GetSignedUrlInput = t.type({
    filename: t.string,
    filetype: t.string,
});

export const GetSignedUrlEvent = t.type({
    field: t.literal('getSignedUrl'),
    args: GetSignedUrlInput,
    identity: tIdentity,
});

export type GetSignedUrlEvent = t.TypeOf<typeof GetSignedUrlEvent>;

export const GetSignedUrlTemporaryInput = t.type({
    filename: t.string,
    filetype: t.string,
});

export const GetSignedUrlTemporaryEvent = t.type({
    field: t.literal('getSignedUrlTemporary'),
    args: GetSignedUrlTemporaryInput,
});

export type GetSignedUrlTemporaryEvent = t.TypeOf<typeof GetSignedUrlTemporaryEvent>;

export const SaveJobSearchParameters = {
    keyword: optionalToUndefined(t.string),
    location: optionalToUndefined(t.string),
    role: optionalToUndefined(t.array(t.string)),
    level: optionalToUndefined(t.array(t.string)),
    jobType: optionalToUndefined(t.string),
    remote: optionalToUndefined(t.boolean),
    security: optionalToUndefined(t.boolean),
    newJobs: optionalToUndefined(t.boolean),
    salaryFrom: optionalToUndefined(t.string),
    salaryTo: optionalToUndefined(t.string),
    salaryCurrency: optionalToUndefined(t.string),
    product: optionalToUndefined(t.string),
    segment: optionalToUndefined(t.string),
};
const SaveJobSearchParametersType = t.type(SaveJobSearchParameters);

export type SaveJobSearchParameters = t.TypeOf<typeof SaveJobSearchParametersType>;

export const SaveJobSearchInput = t.type({
    searchName: t.string,
    ...SaveJobSearchParameters,
    emailAlert: t.boolean,
});

export type SavedJobSearchData = t.TypeOf<typeof SaveJobSearchInput>;

export const SaveJobSearchEvent = t.type({
    field: t.literal('saveJobSearch'),
    args: SaveJobSearchInput,
    identity: tIdentity,
});

export type SaveJobSearchEvent = t.TypeOf<typeof SaveJobSearchEvent>;

export const GetSavedJobSearchesInput = t.type({});

export const GetSavedJobSearchesEvent = t.type({
    field: t.literal('getSavedJobSearches'),
    args: GetSavedJobSearchesInput,
    identity: tIdentity,
});

export type GetSavedJobSearchesEvent = t.TypeOf<typeof GetSavedJobSearchesEvent>;

export const DeleteSavedJobSearchInput = t.type({
    id: t.string,
});

export const DeleteSavedJobSearchEvent = t.type({
    field: t.literal('deleteSavedJobSearch'),
    args: DeleteSavedJobSearchInput,
    identity: tIdentity,
});

export type DeleteSavedJobSearchEvent = t.TypeOf<typeof DeleteSavedJobSearchEvent>;

export const GetSkillsInput = t.type({
    forceFetch: optionalToUndefined(t.boolean),
});

export const GetSkillsEvent = t.type({
    field: t.literal('getSkills'),
    args: GetSkillsInput,
    identity: t.string,
    fromSns: optionalToUndefined(t.boolean),
});

export type GetSkillsEvent = t.TypeOf<typeof GetSkillsEvent>;

export const GetAccreditationsInput = t.type({
    forceFetch: optionalToUndefined(t.boolean),
});

export const GetAccreditationsEvent = t.type({
    field: t.literal('getAccreditations'),
    args: GetAccreditationsInput,
    identity: t.string,
    fromSns: optionalToUndefined(t.boolean),
});

export type GetAccreditationsEvent = t.TypeOf<typeof GetAccreditationsEvent>;

export const GetEmploymentPreferencesInput = t.type({
    forceFetch: optionalToUndefined(t.boolean),
});

export const GetEmploymentPreferencesEvent = t.type({
    field: t.literal('getEmploymentPreferences'),
    args: GetEmploymentPreferencesInput,
    identity: t.string,
    fromSns: optionalToUndefined(t.boolean),
});

export type GetEmploymentPreferencesEvent = t.TypeOf<typeof GetEmploymentPreferencesEvent>;

export const UpdateSavedJobSearchEvent = t.type({
    field: t.literal('updateSavedJobSearch'),
    args: t.type({
        id: t.string,
        enable: t.boolean,
    }),
    identity: tIdentity,
});

export type UpdateSavedJobSearchEvent = t.TypeOf<typeof UpdateSavedJobSearchEvent>;
