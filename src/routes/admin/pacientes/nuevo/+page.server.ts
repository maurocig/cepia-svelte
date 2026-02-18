import { enrollmentSchema } from '$lib/schemas/enrollment';
import { patientSchema } from '$lib/schemas/patient';
import { db } from '$lib/server/db';
import { enrollments, patients } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
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
		console.log('[nuevo paciente] action start');
		const formData = await event.request.formData();
		const intent = formData.get('intent');
		// When coming back to Step 1 to edit, the client should post this hidden field
		const enrollmentIdFromForm = formData.get('enrollmentId');
		const enrollmentId =
			typeof enrollmentIdFromForm === 'string' && enrollmentIdFromForm.length
				? enrollmentIdFromForm
				: null;

		const shouldPersistDraft = intent === 'create-draft' || intent === 'update-draft';
		const shouldComplete = intent === 'complete';

		let enrollmentForm = await superValidate(enrollmentValidator);
		let patientForm = await superValidate(patientValidator);

		if (shouldPersistDraft) {
			enrollmentForm = await superValidate(formData, enrollmentValidator);
		} else if (shouldComplete) {
			patientForm = await superValidate(formData, patientValidator);
		} else {
			return fail(400, {
				enrollmentForm,
				patientForm,
				message: 'Intent inválido para esta acción'
			});
		}

		devLog('[nuevo paciente] action intent', intent);
		if (shouldPersistDraft) devLog('[nuevo paciente] enrollment valid', enrollmentForm.valid);
		if (shouldComplete) devLog('[nuevo paciente] patient valid', patientForm.valid);

		if ((shouldPersistDraft && !enrollmentForm.valid) || (shouldComplete && !patientForm.valid)) {
			if (shouldPersistDraft && !enrollmentForm.valid)
				devLog('[nuevo paciente] enrollment errors', enrollmentForm.errors);
			if (shouldComplete && !patientForm.valid)
				devLog('[nuevo paciente] patient errors', patientForm.errors);
			return fail(400, { enrollmentForm, patientForm });
		}

		// Require an authenticated session (set in hooks.server.ts via betterauth)
		const user = event.locals.user;
		const userId = user?.id;
		devLog('[nuevo paciente] session present', Boolean(user), 'userId', userId);
		if (!userId) {
			devLog('[nuevo paciente] abort: no userId in session');
			return fail(401, { enrollmentForm, patientForm, message: 'No autorizado' });
		}

		if (shouldComplete) {
			if (!enrollmentId) {
				return fail(400, {
					enrollmentForm,
					patientForm,
					message: 'Falta enrollmentId para completar'
				});
			}

			const emptyToNull = (v?: string | null) => {
				if (v == null || v === '') return null;
				return v;
			};

			try {
				await db.transaction(async (tx) => {
					const [updated] = await tx
						.update(enrollments)
						.set({
							formStatus: 'completed',
							completedAt: new Date()
						})
						.where(and(eq(enrollments.id, enrollmentId), eq(enrollments.createdByUserId, userId)))
						.returning({ id: enrollments.id });

					if (!updated?.id) {
						throw new Error('ENROLLMENT_NOT_FOUND_OR_NOT_OWNED');
					}

					await tx
						.insert(patients)
						.values({
							enrollmentId,
							enrolledFirstName: patientForm.data.enrolledFirstName,
							enrolledLastName: patientForm.data.enrolledLastName,
							enrolledDob: patientForm.data.enrolledDob,
							enrolledIdType: patientForm.data.enrolledIdType,
							enrolledIdNumber: patientForm.data.enrolledIdNumber,
							enrolledAddress: patientForm.data.enrolledAddress,
							responsibleAdultName: patientForm.data.responsibleAdultName,
							responsibleAdultPhone: patientForm.data.responsibleAdultPhone,
							consultationReason: patientForm.data.consultationReason,
							attendsSchool: patientForm.data.attendsSchool,
							schoolType: emptyToNull(patientForm.data.schoolType ?? null),
							schoolName: emptyToNull(patientForm.data.schoolName),
							schoolGrade: emptyToNull(patientForm.data.schoolGrade ?? null),
							schoolShift: emptyToNull(patientForm.data.schoolShift ?? null),
							motherDob: emptyToNull(patientForm.data.motherDob),
							motherOccupation: emptyToNull(patientForm.data.motherOccupation),
							fatherDob: emptyToNull(patientForm.data.fatherDob),
							fatherOccupation: emptyToNull(patientForm.data.fatherOccupation),
							siblingsCount: patientForm.data.siblingsCount ?? null,
							familyNotes: emptyToNull(patientForm.data.familyNotes)
						})
						.onConflictDoUpdate({
							target: patients.enrollmentId,
							set: {
								enrolledFirstName: patientForm.data.enrolledFirstName,
								enrolledLastName: patientForm.data.enrolledLastName,
								enrolledDob: patientForm.data.enrolledDob,
								enrolledIdType: patientForm.data.enrolledIdType,
								enrolledIdNumber: patientForm.data.enrolledIdNumber,
								enrolledAddress: patientForm.data.enrolledAddress,
								responsibleAdultName: patientForm.data.responsibleAdultName,
								responsibleAdultPhone: patientForm.data.responsibleAdultPhone,
								consultationReason: patientForm.data.consultationReason,
								attendsSchool: patientForm.data.attendsSchool,
								schoolType: emptyToNull(patientForm.data.schoolType ?? null),
								schoolName: emptyToNull(patientForm.data.schoolName),
								schoolGrade: emptyToNull(patientForm.data.schoolGrade ?? null),
								schoolShift: emptyToNull(patientForm.data.schoolShift ?? null),
								motherDob: emptyToNull(patientForm.data.motherDob),
								motherOccupation: emptyToNull(patientForm.data.motherOccupation),
								fatherDob: emptyToNull(patientForm.data.fatherDob),
								fatherOccupation: emptyToNull(patientForm.data.fatherOccupation),
								siblingsCount: patientForm.data.siblingsCount ?? null,
								familyNotes: emptyToNull(patientForm.data.familyNotes),
								updatedAt: new Date()
							}
						});
				});
			} catch (err) {
				if (err instanceof Error && err.message === 'ENROLLMENT_NOT_FOUND_OR_NOT_OWNED') {
					return fail(404, {
						enrollmentForm,
						patientForm,
						message: 'No se encontró la inscripción a completar'
					});
				}

				console.error('[nuevo paciente] complete enrollment error', err);
				return fail(500, {
					enrollmentForm,
					patientForm,
					message: 'Error al completar el alta del paciente'
				});
			}

			throw redirect(303, '/admin/pacientes?saved=1');
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

			// titular
			holderFirstName: enrollmentForm.data.holderFirstName,
			holderLastName: enrollmentForm.data.holderLastName,
			holderIdType: emptyToNull(enrollmentForm.data.holderIdType),
			holderIdNumber: enrollmentForm.data.holderIdNumber,
			holderPhone: enrollmentForm.data.holderPhone,

			// tratamientos
			psychology: enrollmentForm.data.psychology,
			psychomotricity: enrollmentForm.data.psychomotricity,
			speechTherapy: enrollmentForm.data.speechTherapy,
			psychopedagogy: enrollmentForm.data.psychopedagogy,
			pedagogicalSupport: enrollmentForm.data.pedagogicalSupport,
			physiotherapy: enrollmentForm.data.physiotherapy,
			occupationalTherapy: enrollmentForm.data.occupationalTherapy,
			workshops: enrollmentForm.data.workshops,
			treatmentsNotes: enrollmentForm.data.treatmentsNotes,

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

						holderFirstName: normalized.holderFirstName,
						holderLastName: normalized.holderLastName,
						holderIdType: normalized.holderIdType,
						holderIdNumber: normalized.holderIdNumber,
						holderPhone: normalized.holderPhone,

						psychology: normalized.psychology,
						psychomotricity: normalized.psychomotricity,
						speechTherapy: normalized.speechTherapy,
						psychopedagogy: normalized.psychopedagogy,
						pedagogicalSupport: normalized.pedagogicalSupport,
						physiotherapy: normalized.physiotherapy,
						occupationalTherapy: normalized.occupationalTherapy,
						workshops: normalized.workshops,
						treatmentsNotes: normalized.treatmentsNotes,

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
