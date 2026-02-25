import { db } from '$lib/server/db';
import { enrollments, patients } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	const rows = await db
		.select({
			enrollmentId: enrollments.id,
			status: enrollments.status,
			admissionMode: enrollments.admissionMode,
			admissionDate: enrollments.admissionDate,
			updatedAt: enrollments.updatedAt,
			enrolledFirstName: patients.enrolledFirstName,
			enrolledLastName: patients.enrolledLastName,
			enrolledIdNumber: patients.enrolledIdNumber,
			holderFirstName: enrollments.holderFirstName,
			holderLastName: enrollments.holderLastName,
			responsibleAdultName: patients.responsibleAdultName,
			responsibleAdultPhone: patients.responsibleAdultPhone,
			attendsSchool: patients.attendsSchool,
			schoolName: patients.schoolName
		})
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(eq(enrollments.formStatus, 'completed'))
		.orderBy(desc(enrollments.updatedAt));

	return { patients: rows };
};
