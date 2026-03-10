import { env } from '$env/dynamic/private';
import { render } from 'svelte/server';
import type { RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import AgreementReminderEmail from '$lib/emails/AgreementReminderEmail.svelte';

const querySchema = z.object({
	baseUrl: z.string().optional().default('http://localhost:5173'),
	enrollmentId: z.string().optional().default('demo-id'),
	reminderType: z.enum(['90d', '30d']).optional().default('90d'),
	patientName: z.string().optional().default('Paciente Demo'),
	patientDocument: z.string().optional().default('CI 12345678'),
	holderName: z.string().optional().default('Titular Demo'),
	holderEmail: z.string().email().optional().default('titular@ejemplo.com'),
	expirationDate: z.string().optional().default('2026-06-01'),
	remainingDays: z.coerce.number().int().optional().default(30),
	scheduledFor: z.string().optional().default('2026-03-02')
});

export const GET: RequestHandler = ({ url }) => {
	if (env.NODE_ENV === 'production') {
		return new Response('Not found', { status: 404 });
	}

	const parsed = querySchema.parse(Object.fromEntries(url.searchParams.entries()));

	const html = render(AgreementReminderEmail, {
		props: {
			baseUrl: parsed.baseUrl,
			enrollmentId: parsed.enrollmentId,
			reminderType: parsed.reminderType,
			patientName: parsed.patientName,
			patientDocument: parsed.patientDocument,
			holderName: parsed.holderName,
			holderEmail: parsed.holderEmail,
			expirationDate: parsed.expirationDate,
			remainingDays: parsed.remainingDays,
			scheduledFor: parsed.scheduledFor
		}
	}).body;

	return new Response(html, {
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	});
};
