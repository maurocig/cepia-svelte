<script lang="ts">
	import { page } from '$app/stores';
	import { BellIcon, CircleUserRoundIcon, HomeIcon, PlusIcon, UsersIcon } from 'lucide-svelte';
	import Logout from './Logout.svelte';

	export type AdminNavLink = {
		href: string;
		label: string;
		match?: 'exact' | 'prefix';
		rightText?: string;
		rightVariant?: 'default' | 'alert';
	};

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
	class="sticky flex h-fit w-[300px] flex-col gap-2 self-start rounded-lg bg-white/70 p-4 shadow-md"
>
	<ul class="flex flex-col gap-1">
		{#each links as link (link.href)}
			<li>
				<a
					href={link.href}
					class={'flex items-center gap-4 rounded-md p-2 px-4 text-slate-700 transition hover:text-gray-500' +
						(isActive(link)
							? 'border border-1 border-slate-900/10 bg-slate-100 font-medium transition'
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
