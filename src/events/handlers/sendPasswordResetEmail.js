import logger from '../../config/logger.js'
import transporter from '../../config/mailer.js'

const sendPasswordResetEmail = async({user, token}) => {
    const resetUrl = `${process.env.APP_URL}/api/auth/reset-password/${token}`  // fix: APP_RUL → APP_URL, rest → reset

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,  // fix: EMIL_FROM → EMAIL_FROM
        to: user.email,
        subject: 'Reset your password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Reset your password</h2>
                <p>Hi ${user.name || 'there'},</p>
                <p>Click below to reset your password. Expires in <strong>1 hour</strong>.</p>
                <a href="${resetUrl}"
                   style="display:inline-block; padding:12px 24px; background:#DC2626;
                          color:#fff; text-decoration:none; border-radius:6px; margin:16px 0;">
                    Reset Password
                </a>
                <p>Or copy: <a href="${resetUrl}">${resetUrl}</a></p>
                <p>If you didn't request this, ignore this email. Your password won't change.</p>
            </div>
        `
    })
    logger.info(`[Email] password reset sent to ${user.email}`)  // fix: $[user.email] → ${user.email}
}

export default sendPasswordResetEmail