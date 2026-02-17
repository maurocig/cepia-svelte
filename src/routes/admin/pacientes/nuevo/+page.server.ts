import { enrollmentSchema } from '$lib/schemas/enrollment';
import { patientSchema } from '$lib/schemas/patient';
import { db } from '$lib/server/db';
import { enrollments } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

const enrollmentValidator = zod4(enrollmentSchema);
const patientValidator = zod4(patientSchema);

const devLog = (...args: any[]) => {
	// avoid noisy logs in prod
	if (process.env.NODE_ENV !== 'production') console.log(...args);
};

export const load: PageServerLoad = async () => {
	const t0 = performance.now();
	const enrollmentForm = await superValidate(enrollmentValidator);
	const patientForm = await superValidate(patientValidator);
	devLog('[nuevo paciente] load superValidate ms', Math.round(performance.now() - t0));
	return { enrollmentForm, patientForm };
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

		const shouldPersistDraft = intent === 'create-draft' || intent === 'update-draft';

		// Step 1 submit should NOT validate Step 2 fields.
		// We only validate patient fields for non-Step-1 intents.
		const enrollmentForm = await superValidate(formData, enrollmentValidator);
		const patientForm = shouldPersistDraft
			? await superValidate(patientValidator)
			: await superValidate(formData, patientValidator);

		devLog('[nuevo paciente] action intent', intent);
		devLog('[nuevo paciente] enrollment valid', enrollmentForm.valid);
		if (!shouldPersistDraft) devLog('[nuevo paciente] patient valid', patientForm.valid);

		if (!enrollmentForm.valid || (!shouldPersistDraft && !patientForm.valid)) {
			if (!enrollmentForm.valid)
				devLog('[nuevo paciente] enrollment errors', enrollmentForm.errors);
			if (!shouldPersistDraft && !patientForm.valid)
				devLog('[nuevo paciente] patient errors', patientForm.errors);
			return fail(400, { enrollmentForm, patientForm });
		}

		if (!shouldPersistDraft) {
			return { enrollmentForm, patientForm, enrollmentId: enrollmentId ?? undefined };
		}

		// Require an authenticated session (set in hooks.server.ts via betterauth)
		const user = event.locals.user;
		const userId = user?.id;
		devLog('[nuevo paciente] session present', Boolean(user), 'userId', userId);
		if (!userId) {
			devLog('[nuevo paciente] abort: no userId in session');
			return fail(401, { enrollmentForm, patientForm, message: 'No autorizado' });
		}

		// Normalize empty strings to null (preserves literal unions)
		const emptyToNull = <T extends string>(v: T | null): Exclude<T, ''> | null =>
			v === '' ? null : (v as Exclude<T, ''>);

		// Build a DB payload (Drizzle table property names)
		// If we have an enrollmentId already, we update that row instead of creating a new one.
		const effectiveEnrollmentId = enrollmentId ?? nanoid();

		const normalized = {
			id: effectiveEnrollmentId,
			status: enrollmentForm.data.enrollmentStatus,
			admissionDate: enrollmentForm.data.admissionDate,
			admissionMode: enrollmentForm.data.admissionMode ?? null,
			agreementOrganization: emptyToNull(enrollmentForm.data.agreementOrganization),
			agreementOtherName: emptyToNull(enrollmentForm.data.agreementOtherName),
			agreementExpirationDate: emptyToNull(enrollmentForm.data.agreementExpirationDate),
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
					return fail(404, {
						enrollmentForm,
						patientForm,
						message: 'No se encontró el borrador a actualizar'
					});
				}

				return { enrollmentForm, patientForm, enrollmentId: updated.id };
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

			return { enrollmentForm, patientForm, enrollmentId: inserted?.id ?? effectiveEnrollmentId };
		} catch (err) {
			console.error('[nuevo paciente] insert enrollment error', err);
			return fail(500, { enrollmentForm, patientForm, message: 'Error al guardar el paciente' });
		}
	}
};
