import { db } from '$lib/server/db';
import { enrollments, patients, user } from '$lib/server/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const roleLabel = (role?: string | null) => (role === 'admin' ? 'Admin' : 'Staff');

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	const [profile] = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	const [stats] = await db
		.select({
			count: sql<number>`count(*)`,
			lastCreatedAt: sql<Date | null>`max(${enrollments.createdAt})`
		})
		.from(enrollments)
		.where(and(eq(enrollments.createdByUserId, userId), eq(enrollments.formStatus, 'completed')));

	const recentPatients = await db
		.select({
			enrollmentId: enrollments.id,
			enrolledFirstName: patients.enrolledFirstName,
			enrolledLastName: patients.enrolledLastName,
			enrolledIdType: patients.enrolledIdType,
			enrolledIdNumber: patients.enrolledIdNumber,
			createdAt: enrollments.createdAt
		})
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(and(eq(enrollments.createdByUserId, userId), eq(enrollments.formStatus, 'completed')))
		.orderBy(desc(enrollments.createdAt))
		.limit(10);

	return {
		profile: {
			id: profile?.id ?? userId,
			name: profile?.name ?? locals.user?.name ?? '',
			email: profile?.email ?? locals.user?.email ?? '',
			role: roleLabel(profile?.role ?? locals.user?.role),
			createdAt: profile?.createdAt ?? null
		},
		stats: {
			patientsCreatedCount: Number(stats?.count ?? 0),
			lastCreatedAt: stats?.lastCreatedAt ?? null
		},
		recentPatients
	};
};

