import { loadAdminNavData } from '$lib/server/admin-nav';

export async function load({ locals, url }) {
	return {
		user: locals.user,
		adminNav: url.pathname.startsWith('/admin') ? await loadAdminNavData(locals.user) : null
	};
}
