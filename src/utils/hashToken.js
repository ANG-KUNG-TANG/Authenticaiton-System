import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const SALT_ROUNDS = 12
const PEPPER = process.env.PASSWORD_PEPPER

if (!PEPPER && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: PASSWORD_PEPPER is not defined in environment variables')
}

const HashUtil = {

  async hashPassword(password) {
    return bcrypt.hash(password + PEPPER, SALT_ROUNDS)       
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword + PEPPER, hashedPassword) 
  }

}

export default HashUtil