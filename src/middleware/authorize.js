import { ForbiddenError } from "../utils/Errors.js";


const authorize = (...roles) => (req, res, next) =>{
    if (!req.user){
        return next(new ForbiddenError("Not authenticated"))
    }

    if (!roles.includes(req.user.role)){
        return next(new ForbiddenError('Insufficient permissions'))
    }

    next()
}

export default authorize