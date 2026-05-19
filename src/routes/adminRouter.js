import { Router } from "express";
import UserController from "../controllers/userController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import {validate, validateParams } from '../middleware/validate.js';
import { updateUserSchema, userIdSchema } from "../validator/userValidator.js";


const router =Router()

router.use(authenticate);
router.use(authorize("ADMIN"))

router.get('/',                                     UserController.getAll)
router.get('/:id',  validateParams(userIdSchema),   UserController.getById)
router.put('/:id',  validateParams(userIdSchema), validate(updateUserSchema),   UserController.update)
router.delete('/:id',   validateParams(userIdSchema),   UserController.delete)

export default router