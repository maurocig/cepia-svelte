import { env } from '$env/dynamic/private';
import { escapeHtml, sendEmail } from '$lib/server/email';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';

export const load = async () => {
	return {
		contactForm: await superValidate(zod4(formSchema))
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await sendEmail({
				from: env.CONTACT_FROM_EMAIL ?? 'Cepia <cepia@avx.uy>',
				to: env.CONTACT_TO_EMAIL ?? 'mcigliuti01@gmail.com',
				replyTo: form.data.email,
				subject: 'Nuevo mensaje en tu sitio (cepia.uy)',
				html: `
				<html lang="es">	
					<body>
						<h1>Mensaje de cepia.uy</h1>
						<p>
							${escapeHtml(form.data.name)} (${escapeHtml(form.data.email)}) te ha enviado un mensaje:
						</p>
						<p>
							${escapeHtml(form.data.message)}
						</p>
					</body>

					<style>
						h1 {
							font-size: 2rem;
						}
					</style>
				</html>`
			});
		} catch (error) {
			console.error('[contact] sendEmail failed', error);
			return fail(500, {
				form: {
					...form,
					message: 'No pudimos enviar tu mensaje. Probá de nuevo en unos minutos.'
				}
			});
		}

		throw redirect(303, '/contacto/gracias');
	}
};
