import winston from "winston";

const { combine, timestamp, colorize, printf, json} = winston.format

//Human readable format for development
const devFormate = printf(({level, message, timestamp, ...meta}) =>{
    const extras = Object.keys(meta).length? JSON.stringify(meta, null, 2) : ' '
    return `${timestamp} [${level}]: ${message} ${extras}`
})

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',

    format: process.env.NODE_ENV === 'production'
        ? combine(timestamp(), json())
        : combine(timestamp({format: "HH:mm:ss"}), colorize(), devFormate),

    transports: [
        new winston.transports.Console(),

        //in production alos write to files
        ...(process.env.NODE_ENV === 'production' ? [
            new winston.transports.File({filename: 'logs/errors.log', level: 'error'}),
            new winston.transports.File({ filename: 'logs/combined.log'})
        ] : [])
    ]
})

export default logger