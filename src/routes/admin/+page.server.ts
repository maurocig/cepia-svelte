import { AGREEMENT_REMINDER_TIMEZONE, daysBetweenUtc, todayInTimeZone } from '$lib/server/agreement-reminders';
import { db } from '$lib/server/db';
import { enrollments, patients } from '$lib/server/db/schema';
import { and, asc, desc, eq, isNotNull, lte } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	const today = todayInTimeZone(AGREEMENT_REMINDER_TIMEZONE);
	const in30Days = new Date(`${today}T00:00:00.000Z`);
	in30Days.setUTCDate(in30Days.getUTCDate() + 30);
	const in30DaysYyyyMmDd = in30Days.toISOString().slice(0, 10);
	const in90Days = new Date(`${today}T00:00:00.000Z`);
	in90Days.setUTCDate(in90Days.getUTCDate() + 90);
	const in90DaysYyyyMmDd = in90Days.toISOString().slice(0, 10);

	const enrollmentRows = await db
		.select({
			status: enrollments.status,
			admissionMode: enrollments.admissionMode,
			agreementOrganization: enrollments.agreementOrganization,
			agreementExpirationDate: enrollments.agreementExpirationDate
		})
		.from(enrollments)
		.where(eq(enrollments.formStatus, 'completed'));

	const recentPatients = await db
		.select({
			enrollmentId: enrollments.id,
			updatedAt: enrollments.updatedAt,
			admissionDate: enrollments.admissionDate,
			enrolledFirstName: patients.enrolledFirstName,
			enrolledLastName: patients.enrolledLastName,
			status: enrollments.status,
			admissionMode: enrollments.admissionMode
		})
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(eq(enrollments.formStatus, 'completed'))
		.orderBy(desc(enrollments.updatedAt))
		.limit(5);

	const upcomingExpirations = await db
		.select({
			enrollmentId: enrollments.id,
			expirationDate: enrollments.agreementExpirationDate,
			holderFirstName: enrollments.holderFirstName,
			holderLastName: enrollments.holderLastName,
			holderEmail: enrollments.holderEmail,
			enrolledFirstName: patients.enrolledFirstName,
			enrolledLastName: patients.enrolledLastName
		})
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(
			and(
				eq(enrollments.formStatus, 'completed'),
				eq(enrollments.admissionMode, 'agreement'),
				eq(enrollments.agreementOrganization, 'BPS'),
				isNotNull(enrollments.agreementExpirationDate),
				lte(enrollments.agreementExpirationDate, in90DaysYyyyMmDd)
			)
		)
		.orderBy(asc(enrollments.agreementExpirationDate))
		.limit(5);

	const totalPatients = enrollmentRows.length;
	const activePatients = enrollmentRows.filter((row) => row.status === 'active').length;
	const inactivePatients = totalPatients - activePatients;
	const agreementPatients = enrollmentRows.filter((row) => row.admissionMode === 'agreement').length;
	const upcomingRenewals30d = enrollmentRows.filter(
		(row) =>
			row.admissionMode === 'agreement' &&
			row.agreementOrganization === 'BPS' &&
			row.agreementExpirationDate &&
			row.agreementExpirationDate >= today &&
			row.agreementExpirationDate <= in30DaysYyyyMmDd
	).length;

	return {
		today,
		stats: {
			totalPatients,
			activePatients,
			inactivePatients,
			agreementPatients,
			upcomingRenewals30d
		},
		recentPatients,
		upcomingExpirations: upcomingExpirations.map((row) => ({
			...row,
			daysUntil: row.expirationDate ? daysBetweenUtc(today, row.expirationDate) : null
		}))
	};
};
