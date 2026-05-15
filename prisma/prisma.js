const { log } = require('node:console');
const { PrismaClient} = require('../../generated/prisma');

export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});