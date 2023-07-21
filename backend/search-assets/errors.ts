export class ApplicationError extends Error {
    readonly prefix: string = 'UnknownError';
    readonly exitCode: number = 1;

    constructor(message: string) {
        super(message);
        this.message = `${this.prefix}: ${message}`;
    }
}
