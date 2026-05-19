

class appError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode =statusCode
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'internal error'
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    };
};

export default appError