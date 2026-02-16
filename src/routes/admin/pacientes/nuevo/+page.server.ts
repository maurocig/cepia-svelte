import { enrollmentSchema } from '$lib/schemas/enrollment';
import { db } from '$lib/server/db';
import { enrollments } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

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
		const formData = await event.request.formData();
		const intent = formData.get('intent');
		// When coming back to Step 1 to edit, the client should post this hidden field
		const enrollmentIdFromForm = formData.get('enrollmentId');
		const enrollmentId =
			typeof enrollmentIdFromForm === 'string' && enrollmentIdFromForm.length
				? enrollmentIdFromForm
				: null;

		const form = await superValidate(formData, enrollmentValidator);
		devLog('[nuevo paciente] action intent', intent);
		console.log('FORM VALID:', form.valid);
		if (!form.valid) {
			console.log('FORM ERRORS:', form.errors);
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		const shouldPersistDraft = intent === 'create-draft' || intent === 'update-draft';

		if (!shouldPersistDraft) {
			return { form, enrollmentId: enrollmentId ?? undefined };
		}

		// Require an authenticated session (set in hooks.server.ts via betterauth)
		const user = event.locals.user;
		const userId = user?.id;
		devLog('[nuevo paciente] session present', Boolean(user), 'userId', userId);
		if (!userId) {
			devLog('[nuevo paciente] abort: no userId in session');
			return fail(401, { form, message: 'No autorizado' });
		}

		// Normalize empty strings to null (preserves literal unions)
		const emptyToNull = <T extends string>(v: T | null): Exclude<T, ''> | null =>
			v === '' ? null : (v as Exclude<T, ''>);

		// Build a DB payload (Drizzle table property names)
		// If we have an enrollmentId already, we update that row instead of creating a new one.
		const effectiveEnrollmentId = enrollmentId ?? nanoid();

		const normalized = {
			id: effectiveEnrollmentId,
			status: form.data.enrollmentStatus,
			admissionDate: form.data.admissionDate,
			admissionMode: form.data.admissionMode ?? null,
			agreementOrganization: emptyToNull(form.data.agreementOrganization),
			agreementOtherName: emptyToNull(form.data.agreementOtherName),
			agreementExpirationDate: emptyToNull(form.data.agreementExpirationDate),
			formStatus: 'draft' as const,
			createdByUserId: userId
		};

		devLog('[nuevo paciente] persist enrollment', {
			id: effectiveEnrollmentId,
			status: normalized.status,
			mode: enrollmentId ? 'update' : 'insert'
		});
		try {
			const t1 = performance.now();

			if (enrollmentId) {
				// Update existing draft (only if it belongs to the current user)
				const [updated] = await db
					.update(enrollments)
					.set({
						status: normalized.status,
						admissionDate: normalized.admissionDate,
						admissionMode: normalized.admissionMode,
						agreementOrganization: normalized.agreementOrganization,
						agreementOtherName: normalized.agreementOtherName,
						agreementExpirationDate: normalized.agreementExpirationDate,
						formStatus: normalized.formStatus
					})
					.where(and(eq(enrollments.id, enrollmentId), eq(enrollments.createdByUserId, userId)))
					.returning({ id: enrollments.id });

				devLog(
					'[nuevo paciente] update enrollment ms',
					Math.round(performance.now() - t1),
					'-> id',
					updated?.id
				);

				if (!updated?.id) {
					// Either not found, or not owned by this user
					return fail(404, { form, message: 'No se encontró el borrador a actualizar' });
				}

				return { form, enrollmentId: updated.id };
			}

			// No enrollmentId provided: create a new draft
			const [inserted] = await db
				.insert(enrollments)
				.values(normalized)
				.returning({ id: enrollments.id });

			devLog(
				'[nuevo paciente] insert enrollment ms',
				Math.round(performance.now() - t1),
				'-> id',
				inserted?.id
			);

			return { form, enrollmentId: inserted?.id ?? effectiveEnrollmentId };
		} catch (err) {
			console.error('[nuevo paciente] insert enrollment error', err);
			return fail(500, { form, message: 'Error al guardar el paciente' });
		}
	}
};
