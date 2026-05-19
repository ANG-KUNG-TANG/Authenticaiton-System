import refreshTokenRepo from "../repository/refreshTokenRepo.js";
import tokenRevocationRepo from "../repository/tokenRevocationRepo.js";
import emailVerificationRepo from "../repository/emailVerificationRepo.js";
import passworResetRepo from '../repository/passwordResetRepo.js';
import logger from "../config/logger.js";


const runCleanup = async() => {
    try{
        const [refresh, revoked, verificaitons, resets] = await Promise.all([
            refreshTokenRepo.deleteExpired(),
            tokenRevocationRepo.deleteExpired(),
            emailVerificationRepo.deleteExpired(),
            passworResetRepo.deleteExpired()
        ])

        logger.info(`[Cleanup] Done -
            refresh tokens: ${refresh.count},
            revocations: ${revoked.count},
            verificaitons: ${verificaitons.count},
            password resets: ${resets.count}
            `
        )
    } catch (err) {
        logger.error(`[Cleanup] Failed: `, err.message)
    }
};

export const startCleanupJobs = () => {
    logger.info(`[Cleanup] Jobs scheduled every 6 hours`)
    setInterval(runCleanup, 6 * 60 * 60 * 1000)
    setTimeout(runCleanup, 5000)
}