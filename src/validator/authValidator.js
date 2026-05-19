import { z } from 'zod';
import { createUserSchema, passwordSchema } from './userValidator.js';


export const registerSchema = z.object({
    email: z.string().email().max(255),
    password: passwordSchema,
    name: z.string().max(100).optional()
})

export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8)
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: passwordSchema
})

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email')
})

export const resetPasswordSchema = z.object({
    password: passwordSchema
})

export const tokenParamSchema = z.object({ token: z.string().min(1) })
