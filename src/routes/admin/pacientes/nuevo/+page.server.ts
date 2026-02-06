import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { enrollmentSchema } from './schema';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(enrollmentSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const fd = await event.request.formData();

		console.log('--- RAW FORMDATA START ---');
		for (const [k, v] of fd.entries()) {
			console.log(k, typeof v === 'string' ? JSON.stringify(v) : v);
		}
		console.log('--- RAW FORMDATA END ---');

		// y además:
		console.log('RAW admissionDate:', fd.get('admissionDate'));

		const form = await superValidate(event, zod4(enrollmentSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		// Normalize empty strings to null (preserves literal unions)
		const emptyToNull = <T extends string>(v: T | null): Exclude<T, ''> | null =>
			v === '' ? null : (v as Exclude<T, ''>);

		form.data.agreementOrganization = emptyToNull(form.data.agreementOrganization);
		form.data.agreementOtherName = emptyToNull(form.data.agreementOtherName);

		console.log('NORMALIZED FORM DATA:', form.data);

		// acá después hacés inserts a supabase con form.data
		// form.data.birthdate, etc.
		return { form };
	}
};
