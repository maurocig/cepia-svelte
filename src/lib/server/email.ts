import { env } from '$env/dynamic/private';
import { Resend } from 'resend';

type SendEmailParams = {
	from: string;
	to: string | string[];
	subject: string;
	html: string;
	replyTo?: string | string[];
};

const getRequiredEnv = (name: keyof typeof env) => {
	const value = env[name];
	if (!value) {
		throw new Error(`Missing required env var: ${name}`);
	}

	return value;
};

export const sendEmail = async ({ from, to, subject, html, replyTo }: SendEmailParams) => {
	const resend = new Resend(getRequiredEnv('RESEND_API_KEY'));
	const response = await resend.emails.send({
		from,
		to: Array.isArray(to) ? to : [to],
		replyTo: replyTo ? (Array.isArray(replyTo) ? replyTo : [replyTo]) : undefined,
		subject,
		html
	});
	const resendError = 'error' in response ? response.error : null;
	if (resendError) {
		throw new Error(resendError.message);
	}

	return {
		messageId: 'data' in response ? response.data?.id ?? null : null
	};
};

export const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
		.replaceAll('\n', '<br />');
