import { db } from '$lib/server/db';
import { enrollments, patients } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user?.id) {
		return { patientsCount: 0 };
	}

	const [row] = await db
		.select({ count: sql<number>`count(*)` })
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(eq(enrollments.formStatus, 'completed'));

	return {
		patientsCount: Number(row?.count ?? 0)
	};
};
