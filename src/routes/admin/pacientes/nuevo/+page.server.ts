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
		// IMPORTANT: clone the request so we don't consume the body before superValidate
		const fd = await event.request.clone().formData();

		console.log('--- RAW FORMDATA START ---');
		for (const [k, v] of fd.entries()) {
			console.log(k, typeof v === 'string' ? JSON.stringify(v) : v);
		}
		console.log('--- RAW FORMDATA END ---');

		const form = await superValidate(event, zod4(enrollmentSchema));
		console.log('FORM VALID:', form.valid);
		if (!form.valid) {
			console.log('FORM ERRORS:', form.errors);
		}
		if (!form.valid) {
			return fail(400, { form });
		}
		// Normalize empty strings to null (preserves literal unions)
		const emptyToNull = <T extends string>(v: T | null): Exclude<T, ''> | null =>
			v === '' ? null : (v as Exclude<T, ''>);

		// Build a DB payload (snake_case column names)
		const normalized = {
			status: form.data.enrollmentStatus,
			admission_date: form.data.admissionDate,
			admission_mode: form.data.admissionMode,
			agreement_organization: emptyToNull(form.data.agreementOrganization),
			agreement_other_name: emptyToNull(form.data.agreementOtherName)
		};

		console.log('NORMALIZED FORM DATA:', normalized);

		// Insert into Supabase (server-side client expected on locals)
		const supabase = (event.locals as any).supabase;
		if (!supabase) {
			console.error('Supabase client not found on event.locals.supabase');
			return fail(500, { form, message: 'Server misconfigured: Supabase client not available.' });
		}

		const { data: inserted, error } = await supabase
			.from('enrollments')
			.insert(normalized)
			.select('*')
			.single();

		if (error) {
			console.error('Supabase insert error:', error);
			return fail(400, { form, message: error.message });
		}

		console.log('INSERTED ENROLLMENT:', inserted);

		return {
			form,
			inserted
		};
	}
};
