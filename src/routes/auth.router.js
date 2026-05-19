import { Router} from "express";
import AuthController from "../controllers/auth.controller.js";
import authenticate from "../middleware/authenticate.js";
import { validate, validateParams } from "../middleware/validate.js";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, tokenParamSchema } from "../validator/authValidator.js";
import { 
    authLimiter,
    refreshLimiter, 
    passwordResetLimiter, 
    verifyEmailLimiter 
} from '../middleware/rateLimiters.js'




const router = Router()

router.post('/register', authLimiter, validate(registerSchema), AuthController.register)
router.post('/login',authLimiter, validate(loginSchema), AuthController.login)
router.post('/refresh', refreshLimiter, AuthController.refresh)

router.post('/logout', authenticate, AuthController.logout)
router.post('/logout-all', authenticate, AuthController.logoutAll)

router.get('/verify-email/:token', verifyEmailLimiter, validateParams(tokenParamSchema), AuthController.verifyEmail)

router.post('/resend-verification', authenticate, AuthController.resendVerification)

router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword)
router.get('/reset-password/:token', passwordResetLimiter, validateParams(tokenParamSchema), AuthController.validateResetToken)
router.post('/reset-password/:token', passwordResetLimiter, validateParams(tokenParamSchema), validate(resetPasswordSchema), AuthController.resetPassword)


export default router


