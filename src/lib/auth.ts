import { getRequestEvent } from '$app/server';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from './server/db';

export const auth = betterAuth({
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 8 * 60 // Cache duration in seconds
		}
	},
	emailAndPassword: {
		enabled: true
	},
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	plugins: [
		admin(),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
