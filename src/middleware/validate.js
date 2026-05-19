import { ValidationError } from '../utils/Errors.js';


export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
       const messages = Object.entries(result.error.flatten().fieldErrors)
        .map(([field, errors]) => `${field} : ${errors.join(", ")}`)
        .join(' | ')
        return next(new ValidationError(messages))
    }
    req.body = result.data
    next();
};

export const validateParams = (schema) => (req, res, next) =>{
    const result = schema.safeParse(req.params)
    if (!result.success){
        return next(new ValidationError('Invalid parameters'))
    }
    Object.assign(req.params, result.data)
    next()
};

export const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success){
        return next(new ValidationError('Invalid query paramenters'))
    }
    Object.assign(req.query, result.data)
    next()
}