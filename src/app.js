import 'dotenv/config'
import logger from './config/logger.js'
import requestLogger from './middleware/requestLogger.js'
import express from 'express'
import registerUserHandlers from './events/handlers/userHandler.js'
import userRouter from './routes/userRouter.js'
import errorHandler from './middleware/errorHandler.js'
import registerAuthHandlers from './events/handlers/authHandler.js'  
import adminRouter from './routes/adminRouter.js'
import authRouter from './routes/auth.router.js'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { startCleanupJobs } from './jobs/cleanupJobs.js'


process.on('unhandledRejection', (reason) => {
  logger.error('[unhandledRejection]', reason)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  logger.error('[uncaughtException]', err.message)
  logger.error('[stack]', err.stack)
  process.exit(1)
})

registerAuthHandlers()
registerUserHandlers()

const app = express()
app.set('trust proxy', 1) 
app.use(helmet())
app.use(requestLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/admin/users', adminRouter)

//  test route before 404 handler
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'router works' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  startCleanupJobs()
})


