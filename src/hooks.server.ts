import { building } from '$app/environment';
import { auth } from '$lib/auth';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const authHandle: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth, building });
};

const sessionHandle: Handle = async ({ event, resolve }) => {
	// const t0 = performance.now();
	const session = await auth.api.getSession({ headers: event.request.headers });
	// console.log('getSession ms', Math.round(performance.now() - t0));
	event.locals.user = session?.user;

	// protect /admin routes
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			throw redirect(303, `/auth/login?next=${encodeURIComponent(event.url.pathname)}`);
		}
	}

	const response = await resolve(event);
	return response;
};

export const handle = sequence(authHandle, sessionHandle);
