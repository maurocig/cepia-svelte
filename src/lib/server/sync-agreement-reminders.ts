import { scheduledDateForType } from '$lib/server/agreement-reminders';
import { db } from '$lib/server/db';
import { agreementReminders } from '$lib/server/db/schema';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { nanoid } from 'nanoid';

type SyncAgreementRemindersInput = {
	enrollmentId: string;
	admissionMode?: string | null;
	agreementOrganization?: string | null;
	agreementExpirationDate?: string | null;
};

export const syncAgreementReminders = async ({
	enrollmentId,
	admissionMode,
	agreementOrganization,
	agreementExpirationDate
}: SyncAgreementRemindersInput) => {
	const shouldTrackBpsReminder =
		admissionMode === 'agreement' && agreementOrganization === 'BPS' && Boolean(agreementExpirationDate);

	if (!shouldTrackBpsReminder) {
		await db
			.delete(agreementReminders)
			.where(
				and(
					eq(agreementReminders.enrollmentId, enrollmentId),
					ne(agreementReminders.status, 'sent')
				)
			);
		return;
	}

	const expirationDate = agreementExpirationDate as string;
	const remindersToEnsure = [
		{ reminderType: '90d' as const, scheduledFor: scheduledDateForType(expirationDate, '90d') },
		{ reminderType: '30d' as const, scheduledFor: scheduledDateForType(expirationDate, '30d') }
	];

	for (const reminder of remindersToEnsure) {
		const existingRows = await db
			.select({
				id: agreementReminders.id,
				status: agreementReminders.status,
				scheduledFor: agreementReminders.scheduledFor
			})
			.from(agreementReminders)
			.where(
				and(
					eq(agreementReminders.enrollmentId, enrollmentId),
					eq(agreementReminders.reminderType, reminder.reminderType)
				)
			);

		const rowForTargetSchedule = existingRows.find((row) => row.scheduledFor === reminder.scheduledFor);

		if (rowForTargetSchedule) {
			if (rowForTargetSchedule.status !== 'sent') {
				await db
					.update(agreementReminders)
					.set({
						status: 'pending',
						lastError: null
					})
					.where(eq(agreementReminders.id, rowForTargetSchedule.id));
			}
		} else {
			const existingEditable = existingRows.find((row) => row.status !== 'sent');

			if (existingEditable) {
				await db
					.update(agreementReminders)
					.set({
						scheduledFor: reminder.scheduledFor,
						status: 'pending',
						lastError: null
					})
					.where(eq(agreementReminders.id, existingEditable.id));
			} else {
				await db.insert(agreementReminders).values({
					id: nanoid(),
					enrollmentId,
					reminderType: reminder.reminderType,
					scheduledFor: reminder.scheduledFor,
					status: 'pending'
				});
			}
		}

		const rowsAfterSync = await db
			.select({
				id: agreementReminders.id,
				status: agreementReminders.status,
				scheduledFor: agreementReminders.scheduledFor
			})
			.from(agreementReminders)
			.where(
				and(
					eq(agreementReminders.enrollmentId, enrollmentId),
					eq(agreementReminders.reminderType, reminder.reminderType)
				)
			);

		const rowsToDelete = rowsAfterSync.filter(
			(row) => row.status !== 'sent' && row.scheduledFor !== reminder.scheduledFor
		);

		if (rowsToDelete.length > 0) {
			await db
				.delete(agreementReminders)
				.where(inArray(agreementReminders.id, rowsToDelete.map((row) => row.id)));
		}
	}
};
