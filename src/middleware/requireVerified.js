import { ForbiddenError } from "../utils/Errors.js"

const requiredVerified = (req, res, next) => {
    if (!req.user.isVerified) {
        return next(new ForbiddenError('Please verify you email first'))
    }
    next()
}

export default requiredVerified