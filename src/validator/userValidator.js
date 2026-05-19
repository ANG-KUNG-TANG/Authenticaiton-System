import {  z } from 'zod';
import {cuidSchema} from './appValidator.js'


export const passwordSchema = z.string()
        .min(8, 'Password min 8 characters')
        .max(72, 'Password max 72 characters')
        .regex(/[A-Z]/, 'Need one uppsercase')
        .regex(/[0-9]/, 'Need one number');

export const createUserSchema = z.object({
    email: z.string().email('Invalid email format').max(255),
    password: passwordSchema,
    name: z.string().max(100).optional()
});

export const updateUserSchema = z.object({
    email: z.string().email().max(255).optional(),
    name: z.string().max(100).optional()
});

export const userIdSchema = z.object({
    id: cuidSchema
});

export const adminCreateUsrSchema = z.object({
    email: z.string().email().max(255),
    password: passwordSchema,
    name: z.string().max(100).optional(),
    role: z.enum(["USER","ADMIN"]).default('USER')
})