import prisma from "../config/prisma.js";

const passwordResetRepo = {
    async create({userId, tokenHash, expiresAt}){
        return prisma.passwordReset.create({
            data: {
                tokenHash, 
                expiresAt,
                user: { connect: {id: userId}}}
        })
    },

    async findByTokenHash(tokenHash){
        return prisma.passwordReset.findFirst({
            where: {tokenHash, used: false},
            include: {user: true}
        })
    },

    async deleteByUserId(userId){
        return prisma.passwordReset.deleteMany({ where: {userId}})  // fix: deleteManu → deleteMany
    },

    async markUsed(id){
        return prisma.passwordReset.update({
            where: {id},
            data: {used: true}
        })
    },

    async deleteExpired(){
        return prisma.passwordReset.deleteMany({
            where: { expiresAt: { lt: new Date()}}
        })
    }
}

export default passwordResetRepo