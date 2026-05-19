import rateLimit from "express-rate-limit";

const createLimiter = (windowMinutes, max, message) =>
    rateLimit({
        windowMs:   windowMinutes * 60 * 1000,
        max,
        message:    {success: false, message},
        standardHeaders: true,
        legacyHeaders:  false
    })

export const authLimiter = createLimiter(
    15,10, "Too many attempts, please try again in 15 minutes"
)


export const refreshLimiter = createLimiter(
    15, 30, 'Too many attempts, please try again later'
)

export const passwordResetLimiter = createLimiter(
    60,5, "Too many password reset requests, please try again"
)

export const verifyEmailLimiter = createLimiter(
    60, 5, 'Too many verification attempts, please try again in 1 hour'
)