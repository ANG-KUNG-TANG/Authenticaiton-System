import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto, { sign } from 'crypto';
import { email } from 'zod';
import { de } from 'zod/locales';


const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const ACCESS_EXPIERS = process.env.JWT_ACCESS_EXPIRES || '15ms'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d'


//guard -fail fast if secret misssing
if (!ACCESS_SECRET || !REFRESH_SECRET){
    throw new Error('FATAL: JWT secrets are not defined in enviroments variables')
}

const TokenUtil = {

    //access token
    generateAccessToken(payload){
        return jwt.sign({
            sub: payload.userId,
            email: payload.email,
            role: payload.role,
            isVerified: payload.isVerified,
            jti: uuidv4(),
            type: 'access'
        },
        ACCESS_SECRET,
        {expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'}
        )
    },

    //fefresh Token
    generateRefreshToken(payload){
        return jwt.sign({
            sub: payload.userId,
            family: payload.family,
            jti: uuidv4(),
            type: 'refresh'
        },
        REFRESH_SECRET,
        {expiresIn: REFRESH_EXPIRES}
        )
    },

    //verify token
    verifyAccessToken(token){
        return jwt.verify(token, ACCESS_SECRET)
    },

    verifyRefreshToken(token){
        return jwt.verify(token, REFRESH_SECRET)
    },

    //hash refresh token befor storing in db
    hashToken(rawToke,){
        return crypto
            .createHash('sha256')
            .update(rawToke)
            .digest('hex')
    },

    //parse expiry sting to ms for db expireAt
    getExpiryDate(expiresIn = REFRESH_EXPIRES){
        const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
        const match = expiresIn.match(/^(\d+)([smhd])$/)
        if (!match) throw new Error(`Invalid expiry format: ${expiresIn}`)
        return new Date(Date.now() + parseInt(match[1] * units[match[2]]))
    },

    //generate token family id
    generateFamily(){
        return uuidv4()
    }

}

export default TokenUtil