import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { enrollmentSchema } from './schema';

const enrollmentValidator = zod4(enrollmentSchema);

const devLog = (...args: any[]) => {
	// avoid noisy logs in prod
	if (process.env.NODE_ENV !== 'production') console.log(...args);
};

export const load: PageServerLoad = async () => {
	const t0 = performance.now();
	const form = await superValidate(enrollmentValidator);
	devLog('[nuevo paciente] load superValidate ms', Math.round(performance.now() - t0));
	return { form };
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

		const form = await superValidate(event, enrollmentValidator);
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

		console.log('INSERTED ENROLLMENT:');
	}
};
