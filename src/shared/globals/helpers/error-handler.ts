import  HTTP_STATUS  from 'http-status-codes';

// Define an interface for the structure of an error response
export interface IErrorResponse {
    message: string;
    statusCode: number;
    status: string;
    serializeErrors(): IError; // Method to serialize error response
}

// Define an interface for the structure of a general error object
export interface IError {
    message: string;
    statusCode: number;
    status: string;
}

// Abstract base class for custom errors
export abstract class CustomError extends Error {
    abstract statusCode: number; // Abstract property for HTTP status code
    abstract status: string; // Abstract property for status description

    constructor(message: string) {
        super(message); // Call parent class's constructor with error message
    }

    // Method to serialize error into a standardized format
    serializeErrors(): IError {
        return {
            message: this.message, // Use error message from the instance
            statusCode: this.statusCode, // Use HTTP status code from the instance
            status: this.status, // Use status description from the instance
        };
    }
}


export class BadRequestError extends CustomError{
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';
    constructor(message : string){
        super(message);
    }
}

export class NotFoundError extends CustomError{
    statusCode = HTTP_STATUS.NOT_FOUND;
    status = 'error';
    constructor(message : string){
        super(message);
    }
}

export class NotAuthorizedError extends CustomError{
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    status = 'error';
    constructor(message : string){
        super(message);
    }
}

export class LargeFileError extends CustomError{
    statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
    status = 'error';
    constructor(message : string){
        super(message);
    }
}

export class ServerError extends CustomError{
    statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = 'error';
    constructor(message : string){
        super(message);
    }
}
