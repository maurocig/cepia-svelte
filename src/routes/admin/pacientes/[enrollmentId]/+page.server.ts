import { db } from '$lib/server/db';
import { enrollments, patients } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = locals.user?.id;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	const enrollmentId = params.enrollmentId;

	const [row] = await db
		.select({
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
		})
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(and(eq(enrollments.id, enrollmentId), eq(enrollments.formStatus, 'completed')))
		.limit(1);

	if (!row) {
		throw error(404, 'Paciente no encontrado');
	}

	return { patient: row };
};
