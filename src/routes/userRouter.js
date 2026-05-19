import { Router } from 'express'
import UserController from '../controllers/userController.js'
import { validate, validateParams, validateQuery } from '../middleware/validate.js'
import { createUserSchema, updateUserSchema, userIdSchema } from '../validator/userValidator.js'
import { paginationSchema } from '../validator/appValidator.js'
import authenticate from '../middleware/authenticate.js'
import authorize from '../middleware/authorize.js'
import requiredVerified from '../middleware/requireVerified.js'

const router = Router()
router.use(authenticate)

router.get('/me', authenticate,   UserController.getMe)
router.put('/me', authenticate, requiredVerified, validate(updateUserSchema), UserController.updateMe)
router.delete('/me', authenticate, requiredVerified, authorize("USER", "ADMIN"), UserController.deleteMe)

export default router