import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { Resend } from 'resend';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';

export const load = async () => {
	return {
		contactForm: await superValidate(zod(formSchema))
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		console.log({ form });

		const resend = new Resend(env.RESEND_API_KEY);

		const data = await resend.emails.send({
			from: 'Totem Software <contacto@reci.uy>',
			to: 'mcigliuti01@gmail.com',
			subject: 'Nuevo mensaje en tu sitio (cepia.uy)',
			html: `
			<html lang="es">	
				<body>
					<h1>Mensaje de cepia.uy</h1>
					<p>
						${form.data.name} (${form.data.email}) te ha enviado un mensaje:
					</p>
					<p>
						${form.data.message}
					</p>
				</body>

				<style>
					h1 {
						font-size: 2rem;
					}
				</style>
			</html>`
		});

		await redirect(300, '/contacto/gracias');
		return { form };
	}
};
