import { z } from 'zod/v4';

export const loginSchema = z.object({
	email: z.string().email('Email inválido'),
	password: z.string().min(1, 'Requerido')
});

export type LoginSchema = typeof loginSchema;
