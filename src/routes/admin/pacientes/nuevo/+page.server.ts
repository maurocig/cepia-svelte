import { enrollmentSchema } from '$lib/schemas/enrollment';
import { patientSchema } from '$lib/schemas/patient';
import { summarizeTreatmentAssignments } from '$lib/treatments';
import { db } from '$lib/server/db';
import { isDuplicatePatientDocumentError } from '$lib/server/db/errors';
import { enrollmentTreatments, enrollments, patients } from '$lib/server/db/schema';
import { syncAgreementReminders } from '$lib/server/sync-agreement-reminders';
import {
	formatPersonName,
	normalizeWhitespace,
	sanitizeDocumentNumber,
	type DocumentIdType
} from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

const enrollmentValidator = zod4(enrollmentSchema);
const patientValidator = zod4(patientSchema);

const replaceEnrollmentTreatments = async (
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	enrollmentId: string,
	assignments: {
		treatmentType: string;
		day: string;
		time: string;
		professionalName: string;
	}[]
) => {
	await tx.delete(enrollmentTreatments).where(eq(enrollmentTreatments.enrollmentId, enrollmentId));

	if (assignments.length === 0) return;

	await tx.insert(enrollmentTreatments).values(
		assignments.map((assignment, index) => ({
			id: nanoid(),
			enrollmentId,
			treatmentTypeCode: assignment.treatmentType,
			day: assignment.day,
			time: assignment.time,
			professionalName: assignment.professionalName,
			sortOrder: index
		}))
	);
};

export const load: PageServerLoad = async () => {
	const enrollmentForm = await superValidate(enrollmentValidator);
	const patientForm = await superValidate(patientValidator);
	return { enrollmentForm, patientForm };
};

export const actions: Actions = {
	saveEnrollment: async (event) => {
		const formData = await event.request.formData();
		const enrollmentIdFromForm = formData.get('enrollmentId');
		const enrollmentId =
			typeof enrollmentIdFromForm === 'string' && enrollmentIdFromForm.length
				? enrollmentIdFromForm
				: null;

		const enrollmentForm = await superValidate(formData, enrollmentValidator);
		if (!enrollmentForm.valid) return fail(400, { enrollmentForm });

		const userId = event.locals.user?.id;
		if (!userId) return fail(401, { enrollmentForm, message: 'No autorizado' });

		const emptyToNull = <T extends string>(v: T | null): Exclude<T, ''> | null =>
			v === '' ? null : (v as Exclude<T, ''>);
		const normalizeName = (v: string) => formatPersonName(v);
		const normalizeOptionalText = <T extends string>(v: T | null): Exclude<T, ''> | null => {
			if (v === '' || v == null) return null;
			return normalizeWhitespace(v) as Exclude<T, ''>;
		};
		const normalizeOptionalName = <T extends string>(v: T | null): Exclude<T, ''> | null => {
			if (v === '' || v == null) return null;
			return formatPersonName(v) as Exclude<T, ''>;
		};

		const effectiveEnrollmentId = enrollmentId ?? nanoid();
		const normalizedTreatmentAssignments = enrollmentForm.data.treatmentAssignments.map((assignment) => ({
			treatmentType: assignment.treatmentType,
			day: assignment.day,
			time: assignment.time,
			professionalName: formatPersonName(assignment.professionalName)
		}));
		const treatmentSummary = summarizeTreatmentAssignments(normalizedTreatmentAssignments);
		const normalized = {
			id: effectiveEnrollmentId,
			status: enrollmentForm.data.enrollmentStatus,
			admissionDate: enrollmentForm.data.admissionDate,
			admissionMode: enrollmentForm.data.admissionMode ?? null,
			agreementOrganization: emptyToNull(enrollmentForm.data.agreementOrganization),
			agreementOtherName: normalizeOptionalName(enrollmentForm.data.agreementOtherName),
			agreementExpirationDate:
				enrollmentForm.data.admissionMode === 'agreement' &&
				enrollmentForm.data.agreementOrganization === 'BPS'
					? emptyToNull(enrollmentForm.data.agreementExpirationDate)
					: null,
			treatmentDaysPerWeek: treatmentSummary.treatmentDaysPerWeek,
			treatmentSchedule: JSON.stringify(treatmentSummary.treatmentSchedule),
			holderFirstName: normalizeName(enrollmentForm.data.holderFirstName),
			holderLastName: normalizeName(enrollmentForm.data.holderLastName),
			holderIdType: emptyToNull(enrollmentForm.data.holderIdType),
			holderIdNumber: enrollmentForm.data.holderIdNumber,
			holderPhone: enrollmentForm.data.holderPhone,
			holderEmail: enrollmentForm.data.holderEmail.trim(),
			psychology: treatmentSummary.treatmentFlags.psychology,
			psychomotricity: treatmentSummary.treatmentFlags.psychomotricity,
			speechTherapy: treatmentSummary.treatmentFlags.speechTherapy,
			psychopedagogy: treatmentSummary.treatmentFlags.psychopedagogy,
			pedagogicalSupport: treatmentSummary.treatmentFlags.pedagogicalSupport,
			physiotherapy: treatmentSummary.treatmentFlags.physiotherapy,
			occupationalTherapy: treatmentSummary.treatmentFlags.occupationalTherapy,
			workshops: treatmentSummary.treatmentFlags.workshops,
			treatmentsNotes: enrollmentForm.data.treatmentsNotes,
			formStatus: 'draft' as const,
			createdByUserId: userId
		};

		try {
			if (enrollmentId) {
				const updatedId = await db.transaction(async (tx) => {
					const [updated] = await tx
						.update(enrollments)
						.set({
							status: normalized.status,
							admissionDate: normalized.admissionDate,
							admissionMode: normalized.admissionMode,
							agreementOrganization: normalized.agreementOrganization,
							agreementOtherName: normalized.agreementOtherName,
							agreementExpirationDate: normalized.agreementExpirationDate,
							treatmentDaysPerWeek: normalized.treatmentDaysPerWeek,
							treatmentSchedule: normalized.treatmentSchedule,
						holderFirstName: normalized.holderFirstName,
						holderLastName: normalized.holderLastName,
						holderIdType: normalized.holderIdType,
						holderIdNumber: normalized.holderIdNumber,
						holderPhone: normalized.holderPhone,
						holderEmail: normalized.holderEmail,
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

					if (!updated?.id) {
						throw new Error('ENROLLMENT_NOT_FOUND');
					}

					await replaceEnrollmentTreatments(tx, updated.id, normalizedTreatmentAssignments);

					return updated.id;
				});

				if (!updatedId) {
					return fail(404, { enrollmentForm, message: 'No se encontró el borrador a actualizar' });
				}

				await syncAgreementReminders({
					enrollmentId: updatedId,
					admissionMode: normalized.admissionMode,
					agreementOrganization: normalized.agreementOrganization,
					agreementExpirationDate: normalized.agreementExpirationDate
				});

				return { enrollmentForm, enrollmentId: updatedId };
			}

			const insertedId = await db.transaction(async (tx) => {
				const [inserted] = await tx
					.insert(enrollments)
					.values(normalized)
					.returning({ id: enrollments.id });

				const finalId = inserted?.id ?? effectiveEnrollmentId;
				await replaceEnrollmentTreatments(tx, finalId, normalizedTreatmentAssignments);
				return finalId;
			});

			await syncAgreementReminders({
				enrollmentId: insertedId,
				admissionMode: normalized.admissionMode,
				agreementOrganization: normalized.agreementOrganization,
				agreementExpirationDate: normalized.agreementExpirationDate
			});

			return { enrollmentForm, enrollmentId: insertedId };
		} catch (err) {
			if (err instanceof Error && err.message === 'ENROLLMENT_NOT_FOUND') {
				return fail(404, { enrollmentForm, message: 'No se encontró el borrador a actualizar' });
			}
			console.error('[nuevo paciente] persist enrollment error', err);
			return fail(500, { enrollmentForm, message: 'Error al guardar la inscripción' });
		}
	},

	completePatient: async (event) => {
		const formData = await event.request.formData();
		const enrollmentIdFromForm = formData.get('enrollmentId');
		const enrollmentId =
			typeof enrollmentIdFromForm === 'string' && enrollmentIdFromForm.length
				? enrollmentIdFromForm
				: null;

		const patientForm = await superValidate(formData, patientValidator);
		if (!patientForm.valid) return fail(400, { patientForm });

		const userId = event.locals.user?.id;
		if (!userId) return fail(401, { patientForm, message: 'No autorizado' });
		if (!enrollmentId) return fail(400, { patientForm, message: 'Falta enrollmentId para completar' });

		const emptyToNull = (v?: string | null) => {
			if (v == null || v === '') return null;
			return v;
		};
		const normalizeText = (v: string) => normalizeWhitespace(v);
		const normalizeName = (v: string) => formatPersonName(v);
		const normalizeOptionalText = (v?: string | null) => {
			if (v == null || v === '') return null;
			return normalizeWhitespace(v);
		};
		const normalizeOptionalName = (v?: string | null) => {
			if (v == null || v === '') return null;
			return formatPersonName(v);
		};
		const normalizedPatientDoc = sanitizeDocumentNumber(
			patientForm.data.enrolledIdNumber,
			patientForm.data.enrolledIdType as DocumentIdType
		);

		if (patientForm.data.enrolledIdType === 'CI') {
			const [existingPatientWithCi] = await db
				.select({ enrollmentId: patients.enrollmentId })
				.from(patients)
				.where(
					and(
						eq(patients.enrolledIdType, 'CI'),
						eq(patients.enrolledIdNumber, normalizedPatientDoc),
						ne(patients.enrollmentId, enrollmentId)
					)
				)
				.limit(1);

			if (existingPatientWithCi) {
				patientForm.valid = false;
				patientForm.errors.enrolledIdNumber = ['Ya existe un paciente con ese documento'];
				return fail(400, {
					patientForm,
					message: 'Ya existe un paciente con ese documento'
				});
			}
		}

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
						enrolledFirstName: normalizeName(patientForm.data.enrolledFirstName),
						enrolledLastName: normalizeName(patientForm.data.enrolledLastName),
						enrolledDob: patientForm.data.enrolledDob,
						enrolledIdType: patientForm.data.enrolledIdType,
						enrolledIdNumber: normalizedPatientDoc,
						enrolledAddress: normalizeText(patientForm.data.enrolledAddress),
						responsibleAdultName: normalizeName(patientForm.data.responsibleAdultName),
						responsibleAdultPhone: patientForm.data.responsibleAdultPhone,
						consultationReason: normalizeText(patientForm.data.consultationReason),
						attendsSchool: patientForm.data.attendsSchool,
						schoolType: normalizeOptionalText(patientForm.data.schoolType ?? null),
						schoolName: normalizeOptionalName(patientForm.data.schoolName),
						schoolGrade: emptyToNull(patientForm.data.schoolGrade ?? null),
						schoolShift: normalizeOptionalText(patientForm.data.schoolShift ?? null),
						motherName: normalizeOptionalName(patientForm.data.motherName),
						motherDob: emptyToNull(patientForm.data.motherDob),
						motherOccupation: normalizeOptionalText(patientForm.data.motherOccupation),
						motherPhone: normalizeOptionalText(patientForm.data.motherPhone),
						fatherName: normalizeOptionalName(patientForm.data.fatherName),
						fatherDob: emptyToNull(patientForm.data.fatherDob),
						fatherOccupation: normalizeOptionalText(patientForm.data.fatherOccupation),
						fatherPhone: normalizeOptionalText(patientForm.data.fatherPhone),
						siblingsCount: patientForm.data.siblingsCount ?? null,
						familyNotes: normalizeOptionalText(patientForm.data.familyNotes)
					})
					.onConflictDoUpdate({
						target: patients.enrollmentId,
						set: {
							enrolledFirstName: normalizeName(patientForm.data.enrolledFirstName),
							enrolledLastName: normalizeName(patientForm.data.enrolledLastName),
							enrolledDob: patientForm.data.enrolledDob,
							enrolledIdType: patientForm.data.enrolledIdType,
							enrolledIdNumber: normalizedPatientDoc,
							enrolledAddress: normalizeText(patientForm.data.enrolledAddress),
							responsibleAdultName: normalizeName(patientForm.data.responsibleAdultName),
							responsibleAdultPhone: patientForm.data.responsibleAdultPhone,
							consultationReason: normalizeText(patientForm.data.consultationReason),
							attendsSchool: patientForm.data.attendsSchool,
							schoolType: normalizeOptionalText(patientForm.data.schoolType ?? null),
							schoolName: normalizeOptionalName(patientForm.data.schoolName),
							schoolGrade: emptyToNull(patientForm.data.schoolGrade ?? null),
							schoolShift: normalizeOptionalText(patientForm.data.schoolShift ?? null),
							motherName: normalizeOptionalName(patientForm.data.motherName),
							motherDob: emptyToNull(patientForm.data.motherDob),
							motherOccupation: normalizeOptionalText(patientForm.data.motherOccupation),
							motherPhone: normalizeOptionalText(patientForm.data.motherPhone),
							fatherName: normalizeOptionalName(patientForm.data.fatherName),
							fatherDob: emptyToNull(patientForm.data.fatherDob),
							fatherOccupation: normalizeOptionalText(patientForm.data.fatherOccupation),
							fatherPhone: normalizeOptionalText(patientForm.data.fatherPhone),
							siblingsCount: patientForm.data.siblingsCount ?? null,
							familyNotes: normalizeOptionalText(patientForm.data.familyNotes),
							updatedAt: new Date()
						}
					});
			});
		} catch (err) {
			if (isDuplicatePatientDocumentError(err)) {
				patientForm.valid = false;
				patientForm.errors.enrolledIdNumber = ['Ya existe un paciente con ese documento'];
				return fail(400, {
					patientForm,
					message: 'Ya existe un paciente con ese documento'
				});
			}
			if (err instanceof Error && err.message === 'ENROLLMENT_NOT_FOUND_OR_NOT_OWNED') {
				return fail(404, { patientForm, message: 'No se encontró la inscripción a completar' });
			}
			console.error('[nuevo paciente] complete enrollment error', err);
			return fail(500, { patientForm, message: 'Error al completar el alta del paciente' });
		}

		throw redirect(303, '/admin/pacientes?saved=1');
	}
};
