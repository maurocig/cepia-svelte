<script lang="ts">
	import { page } from '$app/stores';
	import type { AdminNavLink } from '$lib/server/admin-nav';
	import { BellIcon, CircleUserRoundIcon, HomeIcon, PlusIcon, UsersIcon } from 'lucide-svelte';
	import Logout from './Logout.svelte';

	let { links } = $props<{
		links: AdminNavLink[];
	}>();

	function isActive(link: AdminNavLink) {
		const path = String($page.url.pathname);
		const match = link.match ?? (link.href === '/admin' ? 'exact' : 'prefix');

		if (match === 'exact') return path === link.href;
		// prefix match: highlight nested routes too (e.g. /admin/pacientes/nuevo)
		return path === link.href || path.endsWith(link.href + '/');
	}

	function iconKeyFor(href: string): 'home' | 'profile' | 'patients' | 'add' | 'reminders' | null {
		if (href === '/admin') return 'home';
		if (href === '/admin/profile') return 'profile';
		if (href.endsWith('/admin/pacientes')) return 'patients';
		if (href.endsWith('/admin/pacientes/nuevo')) return 'add';
		if (href.endsWith('/admin/recordatorios')) return 'reminders';
		return null;
	}
</script>

<aside
	class="top-[86px] sticky hidden h-fit w-[300px] flex-col gap-2 self-start rounded-lg border border-slate-900/15 bg-white/70 p-4 shadow-md md:flex"
>
	<ul class="flex flex-col gap-1">
		{#each links as link (link.href)}
			<li>
				<a
					href={link.href}
					class={'flex items-center gap-4 rounded-md border border-transparent p-2 px-4 text-slate-700 transition hover:bg-white/70 hover:text-gray-500' +
						(isActive(link)
							? ' border-slate-900/10 bg-slate-100 text-slate-950 shadow-sm ring-1 ring-slate-900/10 font-medium'
							: '')}
				>
					{#if iconKeyFor(link.href) === 'home'}
						<HomeIcon size="22" />
					{:else if iconKeyFor(link.href) === 'patients'}
						<UsersIcon size="22" />
					{:else if iconKeyFor(link.href) === 'profile'}
						<CircleUserRoundIcon size="22" />
					{:else if iconKeyFor(link.href) === 'add'}
						<PlusIcon size="22" />
					{:else if iconKeyFor(link.href) === 'reminders'}
						<BellIcon size="22" />
					{:else}
						<!-- fallback spacing to keep alignment -->
						<span class="inline-block h-[22px] w-[22px]"></span>
					{/if}
					<span>{link.label}</span>
					{#if link.rightText}
						<span
							class={'ml-auto rounded-full px-2 py-0.5 text-xs font-medium ' +
								(link.rightVariant === 'alert'
									? 'bg-amber-100 text-amber-700'
									: 'bg-slate-100 text-slate-500')}>{link.rightText}</span
						>
					{/if}
				</a>
			</li>
		{/each}
	</ul>

	<div class="mb-8"></div>
	<Logout />
</aside>
