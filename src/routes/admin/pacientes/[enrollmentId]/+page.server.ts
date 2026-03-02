import {
	enrollmentEditSchema,
	familyEditSchema,
	patientEditSchema,
	responsibleEditSchema,
	schoolEditSchema,
	treatmentsEditSchema
} from '$lib/schemas/edit-sections';
import { db } from '$lib/server/db';
import { isDuplicatePatientDocumentError } from '$lib/server/db/errors';
import { enrollments, patients } from '$lib/server/db/schema';
import {
	formatPersonName,
	normalizeWhitespace,
	sanitizeDocumentNumber,
	type DocumentIdType
} from '$lib/utils';
import { and, eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

const emptyToNull = (value: string | null | undefined) => {
	const text = String(value ?? '').trim();
	return text.length ? text : null;
};

const patientEditValidator = zod4(patientEditSchema);
const enrollmentEditValidator = zod4(enrollmentEditSchema);
const responsibleEditValidator = zod4(responsibleEditSchema);
const schoolEditValidator = zod4(schoolEditSchema);
const familyEditValidator = zod4(familyEditSchema);
const treatmentsEditValidator = zod4(treatmentsEditSchema);

const requireUserId = (userId?: string) => {
	if (!userId) throw redirect(302, '/auth/login');
	return userId;
};

const selection = {
	enrollmentId: enrollments.id,
	status: enrollments.status,
	admissionDate: enrollments.admissionDate,
	admissionMode: enrollments.admissionMode,
	agreementOrganization: enrollments.agreementOrganization,
	agreementOtherName: enrollments.agreementOtherName,
	agreementExpirationDate: enrollments.agreementExpirationDate,
	holderFirstName: enrollments.holderFirstName,
	holderLastName: enrollments.holderLastName,
	holderIdType: enrollments.holderIdType,
	holderIdNumber: enrollments.holderIdNumber,
	holderPhone: enrollments.holderPhone,
	psychology: enrollments.psychology,
	psychomotricity: enrollments.psychomotricity,
	speechTherapy: enrollments.speechTherapy,
	psychopedagogy: enrollments.psychopedagogy,
	pedagogicalSupport: enrollments.pedagogicalSupport,
	physiotherapy: enrollments.physiotherapy,
	occupationalTherapy: enrollments.occupationalTherapy,
	workshops: enrollments.workshops,
	treatmentsNotes: enrollments.treatmentsNotes,
	enrolledFirstName: patients.enrolledFirstName,
	enrolledLastName: patients.enrolledLastName,
	enrolledDob: patients.enrolledDob,
	enrolledIdType: patients.enrolledIdType,
	enrolledIdNumber: patients.enrolledIdNumber,
	enrolledAddress: patients.enrolledAddress,
	responsibleAdultName: patients.responsibleAdultName,
	responsibleAdultPhone: patients.responsibleAdultPhone,
	consultationReason: patients.consultationReason,
	attendsSchool: patients.attendsSchool,
	schoolType: patients.schoolType,
	schoolName: patients.schoolName,
	schoolGrade: patients.schoolGrade,
	schoolShift: patients.schoolShift,
	motherDob: patients.motherDob,
	motherOccupation: patients.motherOccupation,
	fatherDob: patients.fatherDob,
	fatherOccupation: patients.fatherOccupation,
	siblingsCount: patients.siblingsCount,
	familyNotes: patients.familyNotes
} as const;

const getEditableRow = async (enrollmentId: string) => {
	const [row] = await db
		.select(selection)
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(and(eq(enrollments.id, enrollmentId), eq(enrollments.formStatus, 'completed')))
		.limit(1);

	return row;
};

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUserId(locals.user?.id);
	const row = await getEditableRow(params.enrollmentId);

	if (!row) {
		throw error(404, 'Paciente no encontrado');
	}

	const patientEditForm = await superValidate(
		{
			enrolledFirstName: row.enrolledFirstName,
			enrolledLastName: row.enrolledLastName,
			enrolledIdType: row.enrolledIdType,
			enrolledIdNumber: row.enrolledIdNumber,
			enrolledDob: row.enrolledDob,
			enrolledAddress: row.enrolledAddress,
			consultationReason: row.consultationReason
		} as any,
		patientEditValidator
	);
	const enrollmentEditForm = await superValidate(
		{
			enrollmentStatus: row.status,
			admissionDate: row.admissionDate,
			admissionMode: row.admissionMode ?? undefined,
			agreementOrganization: row.agreementOrganization ?? '',
			agreementOtherName: row.agreementOtherName ?? '',
			agreementExpirationDate: row.agreementExpirationDate ?? '',
			holderFirstName: row.holderFirstName,
			holderLastName: row.holderLastName,
			holderIdType: row.holderIdType ?? '',
			holderIdNumber: row.holderIdNumber,
			holderPhone: row.holderPhone
		} as any,
		enrollmentEditValidator
	);
	const responsibleEditForm = await superValidate(
		{
			responsibleAdultName: row.responsibleAdultName,
			responsibleAdultPhone: row.responsibleAdultPhone
		},
		responsibleEditValidator
	);
	const schoolEditForm = await superValidate(
		{
			attendsSchool: row.attendsSchool,
			schoolType: row.schoolType ?? '',
			schoolName: row.schoolName ?? '',
			schoolGrade: row.schoolGrade ?? '',
			schoolShift: row.schoolShift ?? ''
		},
		schoolEditValidator
	);
	const familyEditForm = await superValidate(
		{
			motherDob: row.motherDob ?? '',
			motherOccupation: row.motherOccupation ?? '',
			fatherDob: row.fatherDob ?? '',
			fatherOccupation: row.fatherOccupation ?? '',
			siblingsCount: row.siblingsCount ?? undefined,
			familyNotes: row.familyNotes ?? ''
		},
		familyEditValidator
	);
	const treatmentsEditForm = await superValidate(
		{
			psychology: row.psychology,
			psychomotricity: row.psychomotricity,
			speechTherapy: row.speechTherapy,
			psychopedagogy: row.psychopedagogy,
			pedagogicalSupport: row.pedagogicalSupport,
			physiotherapy: row.physiotherapy,
			occupationalTherapy: row.occupationalTherapy,
			workshops: row.workshops,
			treatmentsNotes: row.treatmentsNotes ?? ''
		},
		treatmentsEditValidator
	);

	return {
		patient: row,
		patientEditForm,
		enrollmentEditForm,
		responsibleEditForm,
		schoolEditForm,
		familyEditForm,
		treatmentsEditForm
	};
};

export const actions: Actions = {
	patient: async ({ locals, params, request }) => {
		requireUserId(locals.user?.id);
		const enrollmentId = params.enrollmentId;
		const row = await getEditableRow(enrollmentId);
		if (!row) return fail(404, { message: 'Paciente no encontrado' });

		const patientEditForm = await superValidate(request, patientEditValidator);
		if (!patientEditForm.valid) {
			return fail(400, { patientEditForm });
		}

		try {
			await db
				.update(patients)
				.set({
					enrolledFirstName: formatPersonName(patientEditForm.data.enrolledFirstName),
					enrolledLastName: formatPersonName(patientEditForm.data.enrolledLastName),
					enrolledIdType: patientEditForm.data.enrolledIdType,
					enrolledIdNumber: sanitizeDocumentNumber(
						patientEditForm.data.enrolledIdNumber,
						patientEditForm.data.enrolledIdType as DocumentIdType
					),
					enrolledDob: patientEditForm.data.enrolledDob,
					enrolledAddress: normalizeWhitespace(patientEditForm.data.enrolledAddress),
					consultationReason: normalizeWhitespace(patientEditForm.data.consultationReason)
				})
				.where(eq(patients.enrollmentId, enrollmentId));
		} catch (err) {
			if (isDuplicatePatientDocumentError(err)) {
				patientEditForm.valid = false;
				patientEditForm.errors.enrolledIdNumber = ['Ya existe un paciente con ese documento'];
				return fail(400, { patientEditForm });
			}

			console.error('[editar paciente] update patient error', err);
			return fail(500, {
				patientEditForm,
				message: 'No se pudieron guardar los cambios.'
			});
		}

		return { success: true, patientEditForm };
	},

	enrollment: async ({ locals, params, request }) => {
		requireUserId(locals.user?.id);
		const enrollmentId = params.enrollmentId;
		const row = await getEditableRow(enrollmentId);
		if (!row) return fail(404, { message: 'Paciente no encontrado' });

		const enrollmentEditForm = await superValidate(request, enrollmentEditValidator);
		if (!enrollmentEditForm.valid) {
			return fail(400, { enrollmentEditForm });
		}

		await db
			.update(enrollments)
			.set({
				status: enrollmentEditForm.data.enrollmentStatus,
				admissionDate: enrollmentEditForm.data.admissionDate,
				admissionMode: enrollmentEditForm.data.admissionMode ?? null,
				agreementOrganization:
					enrollmentEditForm.data.admissionMode === 'agreement'
						? emptyToNull(enrollmentEditForm.data.agreementOrganization)
						: null,
				agreementOtherName:
					enrollmentEditForm.data.admissionMode === 'agreement' &&
					enrollmentEditForm.data.agreementOrganization === 'other'
						? formatPersonName(enrollmentEditForm.data.agreementOtherName)
						: null,
				agreementExpirationDate:
					enrollmentEditForm.data.admissionMode === 'agreement' &&
					enrollmentEditForm.data.agreementOrganization === 'BPS'
						? emptyToNull(enrollmentEditForm.data.agreementExpirationDate)
						: null,
				holderFirstName: formatPersonName(enrollmentEditForm.data.holderFirstName),
				holderLastName: formatPersonName(enrollmentEditForm.data.holderLastName),
				holderIdType: emptyToNull(enrollmentEditForm.data.holderIdType),
				holderIdNumber: sanitizeDocumentNumber(
					enrollmentEditForm.data.holderIdNumber,
					(enrollmentEditForm.data.holderIdType || '') as DocumentIdType
				),
				holderPhone: enrollmentEditForm.data.holderPhone.trim()
			})
			.where(eq(enrollments.id, enrollmentId));

		return { success: true, enrollmentEditForm };
	},

	responsible: async ({ locals, params, request }) => {
		requireUserId(locals.user?.id);
		const enrollmentId = params.enrollmentId;
		const row = await getEditableRow(enrollmentId);
		if (!row) return fail(404, { message: 'Paciente no encontrado' });

		const responsibleEditForm = await superValidate(request, responsibleEditValidator);
		if (!responsibleEditForm.valid) {
			return fail(400, { responsibleEditForm });
		}

		await db
			.update(patients)
			.set({
				responsibleAdultName: formatPersonName(responsibleEditForm.data.responsibleAdultName),
				responsibleAdultPhone: responsibleEditForm.data.responsibleAdultPhone.trim()
			})
			.where(eq(patients.enrollmentId, enrollmentId));

		return { success: true, responsibleEditForm };
	},

	school: async ({ locals, params, request }) => {
		requireUserId(locals.user?.id);
		const enrollmentId = params.enrollmentId;
		const row = await getEditableRow(enrollmentId);
		if (!row) return fail(404, { message: 'Paciente no encontrado' });

		const schoolEditForm = await superValidate(request, schoolEditValidator);
		if (!schoolEditForm.valid) {
			return fail(400, { schoolEditForm });
		}

		await db
			.update(patients)
			.set({
				attendsSchool: schoolEditForm.data.attendsSchool,
				schoolName:
					schoolEditForm.data.attendsSchool && schoolEditForm.data.schoolName
						? formatPersonName(schoolEditForm.data.schoolName)
						: null,
				schoolType: schoolEditForm.data.attendsSchool ? emptyToNull(schoolEditForm.data.schoolType) : null,
				schoolGrade: schoolEditForm.data.attendsSchool ? emptyToNull(schoolEditForm.data.schoolGrade) : null,
				schoolShift: schoolEditForm.data.attendsSchool ? emptyToNull(schoolEditForm.data.schoolShift) : null
			})
			.where(eq(patients.enrollmentId, enrollmentId));

		return { success: true, schoolEditForm };
	},

	family: async ({ locals, params, request }) => {
		requireUserId(locals.user?.id);
		const enrollmentId = params.enrollmentId;
		const row = await getEditableRow(enrollmentId);
		if (!row) return fail(404, { message: 'Paciente no encontrado' });

		const familyEditForm = await superValidate(request, familyEditValidator);
		if (!familyEditForm.valid) {
			return fail(400, { familyEditForm });
		}

		await db
			.update(patients)
			.set({
				motherDob: emptyToNull(familyEditForm.data.motherDob),
				motherOccupation: emptyToNull(familyEditForm.data.motherOccupation),
				fatherDob: emptyToNull(familyEditForm.data.fatherDob),
				fatherOccupation: emptyToNull(familyEditForm.data.fatherOccupation),
				siblingsCount: familyEditForm.data.siblingsCount ?? null,
				familyNotes: emptyToNull(familyEditForm.data.familyNotes)
			})
			.where(eq(patients.enrollmentId, enrollmentId));

		return { success: true, familyEditForm };
	},

	treatments: async ({ locals, params, request }) => {
		requireUserId(locals.user?.id);
		const enrollmentId = params.enrollmentId;
		const row = await getEditableRow(enrollmentId);
		if (!row) return fail(404, { message: 'Paciente no encontrado' });

		const treatmentsEditForm = await superValidate(request, treatmentsEditValidator);
		if (!treatmentsEditForm.valid) {
			return fail(400, { treatmentsEditForm });
		}

		await db
			.update(enrollments)
			.set({
				psychology: treatmentsEditForm.data.psychology,
				psychomotricity: treatmentsEditForm.data.psychomotricity,
				speechTherapy: treatmentsEditForm.data.speechTherapy,
				psychopedagogy: treatmentsEditForm.data.psychopedagogy,
				pedagogicalSupport: treatmentsEditForm.data.pedagogicalSupport,
				physiotherapy: treatmentsEditForm.data.physiotherapy,
				occupationalTherapy: treatmentsEditForm.data.occupationalTherapy,
				workshops: treatmentsEditForm.data.workshops,
				treatmentsNotes: normalizeWhitespace(treatmentsEditForm.data.treatmentsNotes)
			})
			.where(eq(enrollments.id, enrollmentId));

		return { success: true, treatmentsEditForm };
	}
};
