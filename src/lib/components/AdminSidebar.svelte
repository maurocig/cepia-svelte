<script lang="ts">
	import { page } from '$app/stores';
	import { CircleUserRoundIcon, HomeIcon, PlusIcon, UserIcon, UsersIcon } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import Logout from './Logout.svelte';

	export type AdminNavLink = {
		href: string;
		label: string;
		match?: 'exact' | 'prefix';
	};

	let { userEmail, links } = $props<{
		userEmail: string;
		links: AdminNavLink[];
	}>();

	function isActive(link: AdminNavLink) {
		const path = String($page.url.pathname);
		const match = link.match ?? (link.href === '/admin' ? 'exact' : 'prefix');

		if (match === 'exact') return path === link.href;
		// prefix match: highlight nested routes too (e.g. /admin/pacientes/nuevo)
		return path === link.href || path.endsWith(link.href + '/');
	}

	function iconKeyFor(href: string): 'home' | 'profile' | 'patients' | 'add' | null {
		if (href === '/admin') return 'home';
		if (href === '/admin/profile') return 'profile';
		if (href.endsWith('/admin/pacientes')) return 'patients';
		if (href.endsWith('/admin/pacientes/nuevo')) return 'add';
		return null;
	}
</script>

<aside class="flex h-fit w-[300px] flex-col gap-2 rounded-lg bg-white/80 p-4 shadow-md">
	<a
		href="/admin/profile"
		class={'flex items-center gap-4 rounded-md p-2 pb-4 text-slate-500 transition hover:bg-gray-200 ' +
			(String($page.url.pathname) === '/admin/profile' ? 'bg-gray-200' : '')}
	>
		<CircleUserRoundIcon size="22" />
		<span class="truncate">{userEmail}</span>
	</a>

	<ul class="flex flex-col gap-1 rounded-lg bg-slate-100 p-2">
		{#each links as link (link.href)}
			<li>
				<a
					href={link.href}
					class={'flex items-center gap-4 rounded-md p-2 text-slate-700 transition transition hover:text-gray-500' +
						(isActive(link) ? 'border border-slate-800/10 bg-white shadow-xs' : '')}
				>
					{#if iconKeyFor(link.href) === 'home'}
						<HomeIcon size="22" />
					{:else if iconKeyFor(link.href) === 'patients'}
						<UsersIcon size="22" />
					{:else if iconKeyFor(link.href) === 'profile'}
						<UserIcon size="22" />
					{:else if iconKeyFor(link.href) === 'add'}
						<PlusIcon size="22" />
					{:else}
						<!-- fallback spacing to keep alignment -->
						<span class="inline-block h-[22px] w-[22px]"></span>
					{/if}
					<span>{link.label}</span>
				</a>
			</li>
		{/each}
	</ul>
	<Logout />
</aside>
