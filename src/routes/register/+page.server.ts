import { fail, redirect, type Actions } from '@sveltejs/kit';

interface ReturnObject {
	success: boolean;
	errors: string[];
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
}

export const actions: Actions = {
	register: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const passwordConfirmation = formData.get('passwordConfirmation') as string;

		const returnObject: ReturnObject = {
			success: true,
			email,
			name,
			password,
			passwordConfirmation,
			errors: []
		};

		if (name.length < 3) {
			returnObject.errors.push('El nombre debe tener al menos 3 caracteres');
		}

		if (!email.length) {
			returnObject.errors.push('El email es obligatorio');
		}

		if (!password.length) {
			returnObject.errors.push('La contraseña es obligatoria');
		}

		if (password !== passwordConfirmation) {
			returnObject.errors.push('Las contraseñas no coinciden');
		}

		if (returnObject.errors.length) {
			returnObject.success = false;
			return returnObject;
		}

		const { data, error } = await supabase.auth.signUp({ email, password });

		if (error || !data.user) {
			console.log('hubo un error');
			console.error(error);
			returnObject.success = false;
			return fail(400, returnObject as any);
		}

		const userId = data.user.id;

		await supabase.from('user_names').insert([
			{
				user_id: userId,
				name
			}
		]);

		redirect(303, '/private');
	}
};
