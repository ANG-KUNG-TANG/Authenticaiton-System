import { PrismaClient } from "@prisma/client";
import bcrypt  from 'bcrypt'
import * as dotenv from 'dotenv'



dotenv.config()

const prisma = new PrismaClient()


async function main() {
    const password = await bcrypt.hash(
        'Admin123!' + process.env.PASSWORD_PEPPER,
        12
    )

    await prisma.user.upsert({
        where: { email: "admin@system.com"},
        update: {},
        create: {
            email: 'admin@system.com',
            password,
            name: "System Admin",
            role: 'ADMIN',
            isVerified: true
        }
    })

    console.log('Admin seeded successfully')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())