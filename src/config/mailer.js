import nodemailer from 'nodemailer'
import logger from './logger.js'


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

transporter.verify((error) => {
    if (error){
        logger.error(`[Mailer] Connection failed : `, error.message)
    } else {
        logger.info(`[Mailer] Ready`)
    }
})

export default transporter