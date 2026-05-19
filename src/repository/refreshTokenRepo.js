import prisma from '../config/prisma.js'

const refreshTokenRepo = {

    async create({ userId, tokenHash, family, expiresAt, ipAddress, userAgent }) {
        return prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                family,
                expiresAt,
                ipAddress,
                userAgent
            }
        })
    },

    // find by hash
    async findByTokenHash(tokenHash) {
        return prisma.refreshToken.findUnique({
            where: { tokenHash }
        })
    },

    // find all tokens in a family
    async findByFamily(family) {
        return prisma.refreshToken.findMany({
            where: {
                family,
                isRevoked: false,
                expiresAt: { gt: new Date() }
            }
        })
    },

    // revoke single token
    async revokeToken(id, reason = 'logout') {
        return prisma.refreshToken.update({
            where: { id },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokeReason: reason
            }
        })
    },

    // revoke entire family - breach detection
    async revokeFamily(family, reason = 'breach') {
        return prisma.refreshToken.updateMany({
            where: { family },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokeReason: reason
            }
        })
    },

    // revoke all tokens for a user - logout from all devices
    async revokeAllByUserId(userId, reason = 'logout_all') {
        return prisma.refreshToken.updateMany({
            where: { userId, isRevoked: false },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokeReason: reason
            }
        })
    },

    // replace token store rotation chain
    async markReplaced(id, replacedByToken) {
        return prisma.refreshToken.update({
            where: { id },
            data: { replacedByToken }
        })
    },

    // cleanup delete expired tokens
    async deleteExpired() {
        return prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        })
    }
}

export default refreshTokenRepo