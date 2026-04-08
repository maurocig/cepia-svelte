import { loadAdminNavData } from '$lib/server/admin-nav';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		adminNav: await loadAdminNavData(locals.user)
	};
};
