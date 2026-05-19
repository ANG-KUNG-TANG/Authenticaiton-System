import appError from './appErrors.js'

export class NotFoundError extends appError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404)
        this.name = 'NotFoundError'
    }
}

export class ConflictError extends appError {
    constructor(message = 'Resource already exists') {
        super(message, 409)
        this.name = 'ConflictError'
    }
}

export class UnauthorizedError extends appError {
    constructor(message = 'Unauthorized') {
        super(message, 401)
        this.name = 'UnauthorizedError'
    }
}

export class ForbiddenError extends appError {
    constructor(message = 'Forbidden') {
        super(message, 403)
        this.name = 'ForbiddenError'
    }
}

export class ValidationError extends appError {
    constructor(message = 'Validation failed') {
        super(message, 400)
        this.name = 'ValidationError'
    }
}

export class BadRequestError extends appError {
    constructor(message = 'Bad request') {
        super(message, 400)
        this.name = 'BadRequestError'
    }
}

export class RateLimitError extends appError {
    constructor(message = 'Too many requests') {
        super(message, 429)
        this.name = 'RateLimitError'
    }
}