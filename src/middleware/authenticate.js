import TokenUtil from '../utils/generateTokens.js';
import tokenRevocationRepo from '../repository/tokenRevocationRepo.js';
import { UnauthorizedError} from '../utils/Errors.js'


const authenticate = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')){
            throw new UnauthorizedError("No token provided")
        }
        const token = authHeader.split(" ")[1]
        if (!token) throw new UnauthorizedError('No token provided')
        
        //verity signature expiry
        let payload
        try {
            payload = TokenUtil.verifyAccessToken(token)
        } catch (err) {
            if (err.name === 'TokenExpiredError'){
                throw new UnauthorizedError("Access token expired")
            }
            throw new UnauthorizedError("Invalid access token")
        }

        if ( payload.type !== 'access'){
            throw new UnauthorizedError("Invalid token type")
        }

        const revoked = await tokenRevocationRepo.isRevoked(payload.jti)
        if (revoked) throw new UnauthorizedError('Token has been revoked')
        
        req.user = {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            isVerified: payload.isVerified,
            jti: payload.jti,
            exp: payload.exp
        }
        next()
    } catch (err) {
        next(err)
    }
}

export default authenticate