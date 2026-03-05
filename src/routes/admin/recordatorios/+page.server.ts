import {
	AGREEMENT_REMINDER_TIMEZONE,
	addDaysUtc,
	daysBetweenUtc,
	nextCronRunDateInTimeZone,
	scheduledDateForType,
	todayInTimeZone,
	yyyyMmDdInTimeZone
} from '$lib/server/agreement-reminders';
import { db } from '$lib/server/db';
import { agreementReminders, enrollments, patients } from '$lib/server/db/schema';
import { and, asc, eq, inArray, isNotNull } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getExpirationStatus = (expirationDate: string, today: string) => {
	if (expirationDate < today) return 'expired';
	const in90Days = addDaysUtc(today, 90);
	if (expirationDate <= in90Days) return 'pending-renewal';
	return 'active';
};

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	const rows = await db
		.select({
			enrollmentId: enrollments.id,
			agreementExpirationDate: enrollments.agreementExpirationDate,
			holderFirstName: enrollments.holderFirstName,
			holderLastName: enrollments.holderLastName,
			holderEmail: enrollments.holderEmail,
			enrolledFirstName: patients.enrolledFirstName,
			enrolledLastName: patients.enrolledLastName,
			enrolledIdType: patients.enrolledIdType,
			enrolledIdNumber: patients.enrolledIdNumber
		})
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(
			and(
				eq(enrollments.formStatus, 'completed'),
				eq(enrollments.admissionMode, 'agreement'),
				eq(enrollments.agreementOrganization, 'BPS'),
				isNotNull(enrollments.agreementExpirationDate)
			)
		)
		.orderBy(asc(enrollments.agreementExpirationDate));

	const today = todayInTimeZone(AGREEMENT_REMINDER_TIMEZONE);
	const nextCronRunDate = nextCronRunDateInTimeZone(new Date(), AGREEMENT_REMINDER_TIMEZONE, 9, 5);
	const enrollmentIds = rows.map((row) => row.enrollmentId);
	const persistedReminders =
		enrollmentIds.length > 0
			? await db
					.select({
						enrollmentId: agreementReminders.enrollmentId,
						reminderType: agreementReminders.reminderType,
						scheduledFor: agreementReminders.scheduledFor,
						status: agreementReminders.status,
						sentAt: agreementReminders.sentAt
					})
					.from(agreementReminders)
					.where(inArray(agreementReminders.enrollmentId, enrollmentIds))
			: [];

	const persistedReminderMap = new Map(
		persistedReminders.map((reminder) => [
			`${reminder.enrollmentId}|${reminder.reminderType}|${reminder.scheduledFor}`,
			reminder
		])
	);

	const reminders = rows.map((row) => {
		const expirationDate = row.agreementExpirationDate as string;
		const reminder90Date = scheduledDateForType(expirationDate, '90d');
		const reminder30Date = scheduledDateForType(expirationDate, '30d');
		const expirationDaysUntil = daysBetweenUtc(today, expirationDate);
		const persisted90 = persistedReminderMap.get(`${row.enrollmentId}|90d|${reminder90Date}`);
		const persisted30 = persistedReminderMap.get(`${row.enrollmentId}|30d|${reminder30Date}`);

		const reminder90Sent = persisted90?.status === 'sent';
		const reminder30Sent = persisted30?.status === 'sent';

		return {
			enrollmentId: row.enrollmentId,
			patientName: `${row.enrolledFirstName} ${row.enrolledLastName}`,
			patientDocument: `${row.enrolledIdType} ${row.enrolledIdNumber}`,
			holderName: `${row.holderFirstName} ${row.holderLastName}`.trim(),
			holderEmail: row.holderEmail,
			expirationDate,
			expirationDaysUntil,
			expirationStatus: getExpirationStatus(expirationDate, today),
			reminder90: {
				date:
					reminder90Sent && persisted90?.sentAt
						? yyyyMmDdInTimeZone(new Date(persisted90.sentAt), AGREEMENT_REMINDER_TIMEZONE)
						: reminder90Date < nextCronRunDate
							? nextCronRunDate
							: reminder90Date,
				status: reminder90Sent ? 'sent' : 'pending'
			},
			reminder30: {
				date:
					reminder30Sent && persisted30?.sentAt
						? yyyyMmDdInTimeZone(new Date(persisted30.sentAt), AGREEMENT_REMINDER_TIMEZONE)
						: reminder30Date < nextCronRunDate
							? nextCronRunDate
							: reminder30Date,
				status: reminder30Sent ? 'sent' : 'pending'
			}
		};
	});

	return {
		today,
		reminders
	};
};
