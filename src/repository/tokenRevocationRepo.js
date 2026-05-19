import prisma from "../config/prisma.js";

const tokenRevocationRepo = {

    // Revoke access token by jti
    async create({jti, userId, expiresAt}){
        return prisma.tokenRevocation.create({
            data: {jti, expiresAt, user: {connect: {id: userId}}}
        })
    },

    // Check if access token is revoked
    async isRevoked(jti){
        const record = await prisma.tokenRevocation.findUnique({
            where: {jti}
        })
        return !!record
    },

    // Cleanup expired revocations
    async deleteExpired(){
        return prisma.tokenRevocation.deleteMany({
            where: { expiresAt: { lt: new Date()}}
        })
    },

}

export default tokenRevocationRepo