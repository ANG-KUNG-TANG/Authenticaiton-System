import AuthService from '../services/AuthService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import Response from '../utils/response.js';
import { UnauthorizedError } from '../utils/Errors.js';


const COOKIE_OPTIONS = {
    httpOnly : true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const COOKIE_NAME = 'refreshToken'

const getMeta = (req) => ({
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
})

const setRefreshCookie = (res, token) => {
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
}

const clearRefreshCookie = (res) => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS)
}

//controller
const AuthController = {
    register: asyncHandler(async (req, res) => {
        const result = await AuthService.register(req.body, getMeta(req))

        setRefreshCookie(res, result.refreshToken)

        return Response.created(res, {
            user: result.user,
            accessToken: result.accessToken
        }, 'Registration successful')
    }),

    login: asyncHandler(async (req,res) =>{
        const result =  await AuthService.login(req.body, getMeta(req))

        setRefreshCookie(res, result.refreshToken)

        return Response.success(res, {
            user: result.user,
            accessToken: result.accessToken
        }, 'Login successful')
    }),

    //refresh
    refresh: asyncHandler(async (req, res) => {
        const rawRefreshToken = req.cookies[COOKIE_NAME]
        if (!rawRefreshToken) {
            return Response.error(res, 'No refresh token provided', 401)
        }
        const result = await AuthService.refresh(rawRefreshToken, getMeta(req))

        setRefreshCookie(res, result.refreshToken)

        return Response.success(res, {
            accessToken: result.accessToken
        }, 'Token refreshed')
    }),

    //logout
    logout: asyncHandler(async (req, res) => {
        const rawRefreshToken = req.cookies[COOKIE_NAME]

        if (rawRefreshToken){
            await AuthService.logout(rawRefreshToken, req.user)
        }

        clearRefreshCookie(res)
        return Response.success(res, null, 'Logged out successfully')
    }),

    //logout all
    logoutAll: asyncHandler(async (req, res) => {
        await AuthService.logoutAll(req.user.userId, req.user)
        clearRefreshCookie(res)
        return Response.success(res, null, "Logged out from all devices")
    }),

    //verify email
    verifyEmail: asyncHandler(async (req, res) =>{
        const { token } = req.params
        if (!token) throw new UnauthorizedError('No token provided')
        const result = await AuthService.verifyEmail(token)
        return Response.success(res, null, result.message)
    }),

    //resend verificaiton
    resendVerification: asyncHandler(async (req, res) =>{
        const result = await AuthService.resendVerification(req.user.userId)
        return Response.success(res, null, result.message)
    }),

    //forgot password
    forgotPassword: asyncHandler(async (req, res) => {
        const result = await AuthService.forgotPassword(req.body.email)
        return Response.success(res, null, result.message)
    }),

    //validate resettoken
    validateResetToken: asyncHandler(async (req, res) => {
        const token = (req.params.token || req.query.token || '').trim()
        if (!token) throw new UnauthorizedError('No token provided')
        const result = await AuthService.validateResetToken(token)
        return Response.success(res, result, 'Token is valid')
    }),

    //reset password
    resetPassword: asyncHandler(async (req, res) => {
        const token = (req.params.token || req.query.token || '').trim()
        if (!token) throw new UnauthorizedError('No token provided')
        const result = await AuthService.resetPassword(token, req.body.password)
        return Response.success(res, null, result.message)
    }),
}

export default AuthController