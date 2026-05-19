import crypto from 'crypto'
import userRepo from '../repository/userRepo.js'
import refreshTokenRepo from '../repository/refreshTokenRepo.js'
import tokenRevocationRepo from '../repository/tokenRevocationRepo.js'
import emailVerificationRepo from '../repository/emailVerificationRepo.js'
import passwordResetRepo from '../repository/passwordResetRepo.js'  // fix: was missing
import HashUtil from '../utils/hashToken.js'
import TokenUtil from '../utils/generateTokens.js'
import emitter from '../events/eventEmitter.js'
import { AUTH_EVENTS, EMAIL_EVENTS, USER_EVENTS } from '../events/index.js'
import { NotFoundError, ConflictError, UnauthorizedError } from '../utils/Errors.js'
import prisma from '../config/prisma.js'
// fix: removed bogus imports ({ raw }, { data }, { userInfo })

// ─── helpers ────────────────────────────────────────────────────────────────

const generateRawToken = () => crypto.randomBytes(32).toString('hex')
const hashRawToken     = (raw) => crypto.createHash('sha256').update(raw).digest('hex')

const issueTokens = async (user, meta = {}) => {
    const family       = TokenUtil.generateFamily()
    const accessToken  = TokenUtil.generateAccessToken({ userId: user.id, email: user.email, role: user.role, isVerified: user.isVerified })
    const refreshToken = TokenUtil.generateRefreshToken({ userId: user.id, family })
    const tokenHash    = TokenUtil.hashToken(refreshToken)
    const expiresAt    = TokenUtil.getExpiryDate(process.env.JWT_REFRESH_EXPIRES || '7d')

    await refreshTokenRepo.create({
        userId:    user.id,
        tokenHash,
        family,
        expiresAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent
    })

    return { accessToken, refreshToken }
}

// ─── service ────────────────────────────────────────────────────────────────

const AuthService = {

    async register(data, meta = {}) {
        const existing = await userRepo.findByEmail(data.email)
        if (existing) throw new ConflictError('Email already in use')

        const hashed = await HashUtil.hashPassword(data.password)
        const user   = await userRepo.create({ ...data, password: hashed, role: 'USER' })
        const tokens = await issueTokens(user, meta)

        const rawToken  = generateRawToken()
        const tokenHash = hashRawToken(rawToken)
        await emailVerificationRepo.create({
            userId:    user.id,
            token:     tokenHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })

        emitter.safeEmit(USER_EVENTS.CREATED, user)
        emitter.safeEmit(AUTH_EVENTS.LOGIN, { userId: user.id, ...meta })
        emitter.safeEmit(EMAIL_EVENTS.VERIFY_EMAIL, { user, token: rawToken })

        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role, isVerified: user.isVerified },
            ...tokens
        }
    },

    async login(data, meta = {}) {
        const user = await userRepo.findByEmail(data.email)
        if (!user)          throw new UnauthorizedError('Invalid credentials')
        if (!user.isActive) throw new UnauthorizedError('Account is disabled')

        const valid = await HashUtil.comparePassword(data.password, user.password)
        if (!valid) throw new UnauthorizedError('Invalid credentials')

        const tokens = await issueTokens(user, meta)
        emitter.safeEmit(AUTH_EVENTS.LOGIN, { userId: user.id, ...meta })

        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role, isVerified: user.isVerified },
            ...tokens
        }
    },

    async verifyEmail(rawToken) {
        const tokenHash = hashRawToken(rawToken)
        const record    = await emailVerificationRepo.findByToken(tokenHash)

        if (!record)                       throw new UnauthorizedError('Invalid verification token')
        if (record.expiresAt < new Date()) throw new UnauthorizedError('Verification token expired')
        if (record.user.isVerified)        return { message: 'Email already verified' }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: record.userId },
                data:  { isVerified: true }
            }),
            prisma.emailVerification.delete({ where: { id: record.id } })
        ])

        emitter.safeEmit(AUTH_EVENTS.EMAIL_VERIFIED, { userId: record.userId })
        return { message: 'Email verified successfully' }
    },

    async resendVerification(userId) {
        const user = await userRepo.findById(userId)
        if (!user)           throw new NotFoundError('User not found')
        if (user.isVerified) throw new ConflictError('Email already verified')

        await emailVerificationRepo.deleteByUserId(userId)

        const rawToken  = generateRawToken()
        const tokenHash = hashRawToken(rawToken)
        await emailVerificationRepo.create({
            userId,
            token:     tokenHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })

        emitter.safeEmit(EMAIL_EVENTS.VERIFY_EMAIL, { user, token: rawToken })
        return { message: 'Verification email sent' }
    },

    async refresh(rawRefreshToken, meta = {}) {
        let payload
        try {
            payload = TokenUtil.verifyRefreshToken(rawRefreshToken)
        } catch {
            throw new UnauthorizedError('Invalid or expired refresh token')
        }

        if (payload.type !== 'refresh') throw new UnauthorizedError('Invalid token type')

        const tokenHash = TokenUtil.hashToken(rawRefreshToken)
        const stored    = await refreshTokenRepo.findByTokenHash(tokenHash)
        if (!stored) throw new UnauthorizedError('Refresh token not found')

        if (new Date() > stored.expiresAt) throw new UnauthorizedError('Refresh token expired')

        if (stored.isRevoked) {
            await refreshTokenRepo.revokeFamily(stored.family, 'breach')
            emitter.safeEmit(AUTH_EVENTS.TOKEN_REVOKED, { userId: stored.userId, reason: 'breach', family: stored.family })
            throw new UnauthorizedError('Token reuse detected. All sessions revoked')
        }

        const user = await userRepo.findById(stored.userId)
        if (!user || !user.isActive) throw new UnauthorizedError('User not found or disabled')

        await refreshTokenRepo.revokeToken(stored.id, 'rotation')

        const accessToken     = TokenUtil.generateAccessToken({ userId: user.id, email: user.email, role: user.role })
        const newRefreshToken = TokenUtil.generateRefreshToken({ userId: user.id, family: stored.family })
        const newHash         = TokenUtil.hashToken(newRefreshToken)
        const expiresAt       = TokenUtil.getExpiryDate(process.env.JWT_REFRESH_EXPIRES || '7d')

        const newStored = await refreshTokenRepo.create({
            userId:    user.id,
            tokenHash: newHash,
            family:    stored.family,
            expiresAt,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent
        })

        await refreshTokenRepo.markReplaced(stored.id, newStored.id)
        emitter.safeEmit(AUTH_EVENTS.TOKEN_REFRESHED, { userId: user.id })

        return { accessToken, refreshToken: newRefreshToken }
    },

    async logout(rawRefreshToken, accessTokenPayload) {
        if (rawRefreshToken) {
            const tokenHash = TokenUtil.hashToken(rawRefreshToken)
            const stored    = await refreshTokenRepo.findByTokenHash(tokenHash)
            if (stored && !stored.isRevoked) {
                await refreshTokenRepo.revokeToken(stored.id, 'logout')
            }
        }

        if (accessTokenPayload?.jti && accessTokenPayload?.exp) {
            await tokenRevocationRepo.create({
                jti:       accessTokenPayload.jti,
                userId:    accessTokenPayload.userId,
                expiresAt: new Date(accessTokenPayload.exp * 1000)
            })
        }

        emitter.safeEmit(AUTH_EVENTS.LOGOUT, { userId: accessTokenPayload?.userId })
    },

    async logoutAll(userId, accessTokenPayload) {
        await refreshTokenRepo.revokeAllByUserId(userId, 'logout_all')

        if (accessTokenPayload?.jti && accessTokenPayload?.exp) {
            await tokenRevocationRepo.create({
                jti:       accessTokenPayload.jti,
                userId,
                expiresAt: new Date(accessTokenPayload.exp * 1000)
            })
        }

        emitter.safeEmit(AUTH_EVENTS.LOGOUT, { userId, reason: 'logout_all' })
    },

    async forgotPassword(email){
        const user = await userRepo.findByEmail(email)

        if (!user) return { message: 'If that email exists, a reset link has been sent' }

        await passwordResetRepo.deleteByUserId(user.id)  
       
        const rawToken  = generateRawToken()
        const tokenHash = hashRawToken(rawToken)
        console.log('>>> FORGOT - rawToken: ', rawToken)
        console.log(">>> FORGOT - tokenHas: ", tokenHash)
        await passwordResetRepo.create({
            userId:    user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        })

        emitter.safeEmit(EMAIL_EVENTS.PASSWORD_RESET, { user, token: rawToken })
        emitter.safeEmit(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, { userId: user.id })

        return { message: 'If that email exists, a reset link has been sent' }
    },

    //validate reset token
    async validateResetToken(rawToken) {
        const tokenHash = hashRawToken(rawToken)
        const record = await passwordResetRepo.findByTokenHash(tokenHash)

        if (!record || record.used)          throw new UnauthorizedError('Invalid or expired reset token')
        if (record.expiresAt < new Date())   throw new UnauthorizedError('Reset token expired')

        // just confirm it's valid — don't do anything yet
        return { valid: true, email: record.user.email }
    },

    //reset password
    async resetPassword(rawToken, newPassword){
        const tokenHash = hashRawToken(rawToken)                              
        const record    = await passwordResetRepo.findByTokenHash(tokenHash)  
        if (!record || record.used) throw new UnauthorizedError('Invalid or expired reset token')
        if (record.expiresAt < new Date()) throw new UnauthorizedError('Reset token expired')

        const hashed = await HashUtil.hashPassword(newPassword) 

        await prisma.$transaction([
            prisma.user.update({
                where: { id: record.userId },
                data:  { password: hashed }  
            }),
            prisma.passwordReset.update({    
                where: { id: record.id },
                data:  { used: true }
            }),
            prisma.refreshToken.updateMany({
                where: { userId: record.userId, isRevoked: false },
                data:  { isRevoked: true, revokedAt: new Date(), revokeReason: 'password_reset' }
            })
        ])

        emitter.safeEmit(AUTH_EVENTS.PASSWORD_CHANGED, { userId: record.userId })
        return { message: 'Password reset successfully. Please log in again' }
    },

    
}

export default AuthService