import { z } from "zod";
 
export const formSchema = z.object({
  name: z.string().min(2, {message: 'El nombre debe tener al menos 2 caracteres'}).max(50, {message: 'El nombre no puede tener más de 50 caracteres'}),
	email: z.string().email({message: 'El email no es válido'}),
	message: z.string().min(10, {message: 'El mensaje debe tener al menos 10 caracteres'}).max(1000, 'El mensaje no puede tener más de 1000 caracteres'),
});
 
export type FormSchema = typeof formSchema;