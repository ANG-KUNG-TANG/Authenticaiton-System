import appError from '../utils/appErrors.js'
import { ZodError } from 'zod'
import logger from '../config/logger.js'

const handlePrismaError = (err) => {
    switch (err.code) {
        case 'P2002':
            const field = err.meta?.target?.[0] || 'field'
            return new appError(`${field} already exists`, 409)
        case 'P2025':
            return new appError('Record not found', 404)
        case 'P2003':
            return new appError('Related record not found', 404)
        default:
            return new appError('Database error', 500)
    }
}

const handleZodError = (err) => {
    const messages = err.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(' | ')
    return new appError(messages, 400)
}

const errorHandler = (err, req, res, next) => {
    console.log("ERROR NAME: ", err.name)
    console.log("ERROR MESSAGE:", err.message)
    console.log("ERROR STACK: ", err.stack)
    let error = err

    if (err.name === 'PrismaClientKnownRequestError') {
        error = handlePrismaError(err)
    }

    if (err instanceof ZodError) {
        error = handleZodError(err)
    }

    if (err.name === 'JsonWebTokenError') {
        error = new appError('Invalid token', 401)
    }

    if (err.name === 'TokenExpiredError') {
        error = new appError('Token expired', 401)
    }

    if (error.isOperational) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
    }

    logger.error(`Unhandled error ${req.method} ${req.path}`, {
        error:  err.message,
        stack:  err.stack,
        userId: req.user?.userId
    })

    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Something went wrong'
    })
}

export default errorHandler