import { env } from '$env/dynamic/private';
import {
	AGREEMENT_REMINDER_TIMEZONE,
	AGREEMENT_REMINDER_TYPES,
	scheduledDateForType,
	todayInTimeZone,
	type AgreementReminderType
} from '$lib/server/agreement-reminders';
import { db } from '$lib/server/db';
import { agreementReminders, enrollments, patients } from '$lib/server/db/schema';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { json, type RequestEvent } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { Resend } from 'resend';

const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');

const bearerTokenFromHeader = (authorizationHeader: string | null) => {
	if (!authorizationHeader?.startsWith('Bearer ')) return null;
	return authorizationHeader.slice('Bearer '.length).trim();
};

const buildReminderSubject = (reminderType: AgreementReminderType, expirationDate: string) =>
	`Recordatorio ${reminderType === '90d' ? '90' : '30'} días - Convenio BPS vence el ${expirationDate}`;

const buildReminderHtml = ({
	baseUrl,
	enrollmentId,
	reminderType,
	patientName,
	patientDocument,
	holderName,
	holderEmail,
	expirationDate,
	scheduledFor
}: {
	baseUrl: string;
	enrollmentId: string;
	reminderType: AgreementReminderType;
	patientName: string;
	patientDocument: string;
	holderName: string;
	holderEmail: string;
	expirationDate: string;
	scheduledFor: string;
}) => {
	const patientUrl = `${baseUrl.replace(/\/$/, '')}/admin/pacientes/${enrollmentId}`;
	return `
		<html lang="es">
			<body>
				<h2>Recordatorio de convenio BPS</h2>
				<p>Tipo de recordatorio: <strong>${escapeHtml(reminderType)}</strong></p>
				<p>Fecha programada: <strong>${escapeHtml(scheduledFor)}</strong></p>
				<p>Vencimiento del convenio: <strong>${escapeHtml(expirationDate)}</strong></p>
				<hr />
				<p>Paciente: ${escapeHtml(patientName)}</p>
				<p>Documento: ${escapeHtml(patientDocument)}</p>
				<p>Titular: ${escapeHtml(holderName)}</p>
				<p>Email titular: ${escapeHtml(holderEmail)}</p>
				<p>
					<a href="${escapeHtml(patientUrl)}">Ver ficha del paciente</a>
				</p>
			</body>
		</html>
	`;
};

const runCron = async ({ request }: RequestEvent) => {
	const cronSecret = env.CRON_SECRET;
	const providedToken = bearerTokenFromHeader(request.headers.get('authorization'));

	if (!cronSecret || providedToken !== cronSecret) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!env.RESEND_API_KEY || !env.REMINDERS_INTERNAL_EMAIL || !env.REMINDERS_FROM_EMAIL) {
		return json(
			{
				error:
					'Missing required env vars: RESEND_API_KEY, REMINDERS_INTERNAL_EMAIL, REMINDERS_FROM_EMAIL'
			},
			{ status: 500 }
		);
	}

	const resend = new Resend(env.RESEND_API_KEY);
	const today = todayInTimeZone(AGREEMENT_REMINDER_TIMEZONE);
	const baseUrl = env.BETTER_AUTH_BASE_URL ?? env.BETTER_AUTH_URL ?? 'http://localhost:5173';

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
		);

	let processed = 0;
	let sent = 0;
	let failed = 0;
	let skippedAlreadySent = 0;

	for (const row of rows) {
		const expirationDate = row.agreementExpirationDate as string;

		for (const reminderType of AGREEMENT_REMINDER_TYPES) {
			const scheduledFor = scheduledDateForType(expirationDate, reminderType);
			if (scheduledFor > today) continue;

			processed += 1;

			await db
				.insert(agreementReminders)
				.values({
					id: nanoid(),
					enrollmentId: row.enrollmentId,
					reminderType,
					scheduledFor,
					status: 'pending'
				})
				.onConflictDoNothing();

			const [existingReminder] = await db
				.select({
					id: agreementReminders.id,
					status: agreementReminders.status
				})
				.from(agreementReminders)
				.where(
					and(
						eq(agreementReminders.enrollmentId, row.enrollmentId),
						eq(agreementReminders.reminderType, reminderType),
						eq(agreementReminders.scheduledFor, scheduledFor)
					)
				)
				.limit(1);

			if (!existingReminder) continue;
			if (existingReminder.status === 'sent') {
				skippedAlreadySent += 1;
				continue;
			}

			const now = new Date();

			try {
				const response = await resend.emails.send({
					from: env.REMINDERS_FROM_EMAIL,
					to: [env.REMINDERS_INTERNAL_EMAIL],
					replyTo: env.REMINDERS_REPLY_TO || undefined,
					subject: buildReminderSubject(reminderType, expirationDate),
					html: buildReminderHtml({
						baseUrl,
						enrollmentId: row.enrollmentId,
						reminderType,
						patientName: `${row.enrolledFirstName} ${row.enrolledLastName}`,
						patientDocument: `${row.enrolledIdType} ${row.enrolledIdNumber}`,
						holderName: `${row.holderFirstName} ${row.holderLastName}`.trim(),
						holderEmail: row.holderEmail,
						expirationDate,
						scheduledFor
					})
				});

				const resendError = 'error' in response ? response.error : null;
				if (resendError) throw new Error(resendError.message);

				const resendMessageId = 'data' in response ? (response.data?.id ?? null) : null;

				await db
					.update(agreementReminders)
					.set({
						status: 'sent',
						sentAt: now,
						lastAttemptAt: now,
						attemptCount: sql`${agreementReminders.attemptCount} + 1`,
						resendMessageId,
						lastError: null
					})
					.where(eq(agreementReminders.id, existingReminder.id));

				sent += 1;
			} catch (error) {
				await db
					.update(agreementReminders)
					.set({
						status: 'failed',
						lastAttemptAt: now,
						attemptCount: sql`${agreementReminders.attemptCount} + 1`,
						lastError: error instanceof Error ? error.message : 'Unknown resend error'
					})
					.where(eq(agreementReminders.id, existingReminder.id));

				failed += 1;
			}
		}
	}

	return json({
		today,
		processed,
		sent,
		failed,
		skippedAlreadySent
	});
};

export const GET = runCron;
export const POST = runCron;
