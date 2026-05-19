import emitter from '../eventEmitter.js'
import { AUTH_EVENTS, EMAIL_EVENTS } from '../index.js'
import sendPasswordResetEmail from './sendPasswordResetEmail.js'
import sendVerificationEmail from './sendVerificationEmail.js'

const registerAuthHandlers = () => {

  emitter.on(AUTH_EVENTS.LOGIN, ({ userId, ipAddress }) => {
    console.log(`[AUTH] Login: ${userId} from ${ipAddress}`)
    // later: detect suspicious login location, send alert email
  })

  emitter.on(AUTH_EVENTS.LOGOUT, ({ userId, reason }) => {
    console.log(`[AUTH] Logout: ${userId} reason: ${reason || 'logout'}`)
  })

  emitter.on(AUTH_EVENTS.TOKEN_REFRESHED, ({ userId }) => {
    console.log(`[AUTH] Token refreshed: ${userId}`)
  })

  emitter.on(AUTH_EVENTS.TOKEN_REVOKED, ({ userId, reason, family }) => {
    console.log(`[AUTH] Token family revoked: ${userId} reason: ${reason}`)
    // later: send security alert email — possible breach
  })

  emitter.on(EMAIL_EVENTS.VERIFY_EMAIL, async ({user,token})=>{
    try {
      await sendVerificationEmail({user, token})
    } catch (err){
      console.error(`[Email] Failed to send verificaiton email :`, err.message)
    }
  })

  emitter.on(EMAIL_EVENTS.PASSWORD_RESET, async ({ user, token}) => {
    try{
      await sendPasswordResetEmail({user, token})
    } catch (err){
      console.log(`[Email] Failed to send password reset email :`, err.message)
    }
  })
}

export default registerAuthHandlers