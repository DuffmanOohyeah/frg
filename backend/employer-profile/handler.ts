import { HandlerContext } from './main';
import { CreateEmployerProfileEvent, createEmployerProfile } from './handlers/createEmployerProfile';
import { OutputProfile } from './handlers/Profile';
import { GetEmployerProfileEvent, getEmployerProfile } from './handlers/getEmployerProfile';
import { updateEmployerProfile, UpdateEmployerProfileEvent } from './handlers/updateEmployerProfile';
import { AddCandidateToShortlistEvent, addCandidateToShortlist } from './handlers/addCandidateToShortlist';
import { RemoveCandidateFromShortlistEvent, removeCandidateFromShortlist } from './handlers/removeCandidateFromShortlist';
import { GetCandidateShortlistEvent, getCandidateShortlist } from './handlers/getCandidateShortlist';
import { getSavedCandidateSearches, GetSavedCandidateSearchesEvent, SavedCandidateSearch } from './handlers/getSavedCandidateSearches';
import { saveCandidateSearch, SavedCandidateSearchEvent } from './handlers/saveCandidateSearch';
import { deleteSavedCandidateSearch, DeleteSavedCandidateSearchEvent, DeleteSavedCandidateSearchOutput } from './handlers/deleteSavedCandidateSearch';
import { updateSavedCandidateSearch, UpdateSavedCandidateSearchEvent, UpdateSavedCandidateSearchOutput } from './handlers/updateSavedCandidateSearch';
import { addEmployerResumeRequestsLogs, AddEmployerResumeRequestsLogsEvent } from './handlers/addEmployerResumeRequestsLogs';
import { getEmployerResumeRequestsLogs, GetEmployerResumeRequestsLogsEvent } from './handlers/getEmployerResumeRequestLogs';

const handlers = {
    createEmployerProfile: {
        inputCodec: CreateEmployerProfileEvent,
        fn: async (input: CreateEmployerProfileEvent, context: HandlerContext): Promise<OutputProfile> => {
            try {
                return await createEmployerProfile(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getEmployerProfile: {
        inputCodec: GetEmployerProfileEvent,
        fn: async (input: GetEmployerProfileEvent, context: HandlerContext): Promise<OutputProfile> => {
            try {
                return await getEmployerProfile(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    updateEmployerProfile: {
        inputCodec: UpdateEmployerProfileEvent,
        fn: async (input: UpdateEmployerProfileEvent, context: HandlerContext): Promise<OutputProfile> => {
            try {
                return await updateEmployerProfile(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    // Shortlisting Candidates
    addCandidateToShortlist: {
        inputCodec: AddCandidateToShortlistEvent,
        fn: async (input: AddCandidateToShortlistEvent, context: HandlerContext): Promise<{ candidateId: string }> => {
            try {
                return await addCandidateToShortlist(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    removeCandidateFromShortlist: {
        inputCodec: RemoveCandidateFromShortlistEvent,
        fn: async (input: RemoveCandidateFromShortlistEvent, context: HandlerContext): Promise<{ candidateId: string }> => {
            try {
                return await removeCandidateFromShortlist(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getCandidateShortlist: {
        inputCodec: GetCandidateShortlistEvent,
        fn: async (input: GetCandidateShortlistEvent, context: HandlerContext): Promise<{ candidateIds: string[] }> => {
            try {
                return await getCandidateShortlist(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    saveCandidateSearch: {
        inputCodec: SavedCandidateSearchEvent,
        fn: async (input: SavedCandidateSearchEvent, context: HandlerContext): Promise<SavedCandidateSearch> => {
            try {
                return await saveCandidateSearch(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getSavedCandidateSearches: {
        inputCodec: GetSavedCandidateSearchesEvent,
        fn: async (input: GetSavedCandidateSearchesEvent, context: HandlerContext): Promise<SavedCandidateSearch[]> => {
            try {
                return await getSavedCandidateSearches(input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    deleteSavedCandidateSearch: {
        inputCodec: DeleteSavedCandidateSearchEvent,
        fn: async (input: DeleteSavedCandidateSearchEvent, context: HandlerContext): Promise<DeleteSavedCandidateSearchOutput> => {
            try {
                return await deleteSavedCandidateSearch(input.args.id, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    updateSavedCandidateSearch: {
        inputCodec: UpdateSavedCandidateSearchEvent,
        fn: async (input: UpdateSavedCandidateSearchEvent, context: HandlerContext): Promise<UpdateSavedCandidateSearchOutput> => {
            try {
                return await updateSavedCandidateSearch(input.args.id, input.args.enable, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    // Employer Resume Requests Logs
    // Note we don't store any Resume details or statuses. The log is just used so that we can tell users what
    // they have previously requested
    addEmployerResumeRequestsLogs: {
        inputCodec: AddEmployerResumeRequestsLogsEvent,
        fn: async (input: AddEmployerResumeRequestsLogsEvent, context: HandlerContext): Promise<{ candidateId: string }> => {
            try {
                return await addEmployerResumeRequestsLogs(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    getEmployerResumeRequestsLogs: {
        inputCodec: GetEmployerResumeRequestsLogsEvent,
        fn: async (input: GetEmployerResumeRequestsLogsEvent, context: HandlerContext): Promise<{ candidateIds: string[] }> => {
            try {
                return await getEmployerResumeRequestsLogs(input.args, input.identity, context);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
};

export default handlers;
