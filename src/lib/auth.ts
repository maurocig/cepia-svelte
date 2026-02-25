import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from './server/db';

const normalizeBaseUrl = (url?: string): string | undefined => {
	if (!url) return undefined;
	if (/^https?:\/\//i.test(url)) return url;
	if (url.includes('localhost') || url.startsWith('127.0.0.1')) return `http://${url}`;
	return `https://${url}`;
};

const baseURL = normalizeBaseUrl(
	env.BETTER_AUTH_BASE_URL ?? env.BETTER_AUTH_URL ?? env.VERCEL_URL ?? undefined
);

export const auth = betterAuth({
	baseURL,
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 8 * 60 // Cache duration in seconds
		}
	},
	emailAndPassword: {
		enabled: true,
		disableSignUp: true
	},
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	plugins: [
		admin(),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
