import prisma from "../config/prisma.js";

const emailVerificationRepo ={
    async create({ userId, token, expiresAt }) {
    return prisma.emailVerification.create({
        data: {
            token,
            expiresAt,
            user: { connect: { id: userId } }
        }
    })
    },

    //find tokes valid or not
    async findByToken(token){
        return prisma.emailVerification.findUnique({
            where: {token},
            include: { user: true }
        })
    },

    //delete by users id
    async deleteByUserId(userId) {
        return prisma.emailVerification.deleteMany({ where: { userId } })  // deleteMany + correct field
    },

    //delety by id
    async deleteById(id){
        return prisma.emailVerification.delete({ where: { id}})
    },

    //delete expire tokens
    async deleteExpired(){
        return prisma.emailVerification.deleteMany({
            where: { expiresAt: { lt: new Date()}}
        })
    }
}

export default emailVerificationRepo