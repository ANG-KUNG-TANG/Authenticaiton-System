import logger from "../../config/logger.js";
import transporter from "../../config/mailer.js";


const sendVerificationEmail = async ({user, token}) => {
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email/${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to:    user.email,
        subject:    'Verify your email address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify your email</h2>
                <p>Hi ${user.name || 'there'},</p>
                <p>Click below to verify your email. Expires in <strong>24 hours</strong>.</p>
                <a href="${verifyUrl}"
                   style="display:inline-block; padding:12px 24px; background:#4F46E5;
                          color:#fff; text-decoration:none; border-radius:6px; margin:16px 0;">
                    Verify Email
                </a>
                <p>Or copy: <a href="${verifyUrl}">${verifyUrl}</a></p>
                <p>If you didn't create an account, ignore this email.</p>
            </div>
        `
    })
    logger.info(`[Email] Verifiaction sent to ${user.email}`)

}
export default sendVerificationEmail