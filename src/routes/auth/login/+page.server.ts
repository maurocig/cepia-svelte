import { auth } from '$lib/auth';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { loginSchema } from './schema';

export const load = async () => {
	const form = await superValidate(zod4(loginSchema));
	return { form };
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(loginSchema));
		if (!form.valid) return fail(400, { form });

		const res = await auth.api.signInEmail({
			headers: event.request.headers,
			body: {
				email: form.data.email,
				password: form.data.password
			}
		});

		if (!res?.user) {
			return fail(400, {
				form: {
					...form,
					message: 'email o password incorrectos'
				}
			});
		}

		const next = event.url.searchParams.get('next') ?? '/admin';
		throw redirect(303, next);
	}
};
