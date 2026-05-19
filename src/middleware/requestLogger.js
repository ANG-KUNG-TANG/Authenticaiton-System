import logger from "../config/logger.js";

const requestLogger = (req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() -start
        const level = res.statusCode >= 500 ? 'error'
                    : res.statusCode >= 400 ? 'warn'
                    : 'info'


        logger[level](`${req.method}  ${req.path}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            ip:     req.ip,
            userId: req.user?.userId,
            userAgent: req.headers['user-agent']
        })
    })
    next()
}

export default requestLogger