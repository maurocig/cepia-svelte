<script lang="ts">
	import { page } from '$app/stores';
	import type { AdminNavLink } from '$lib/server/admin-nav';
	import * as Sheet from '$lib/components/ui/sheet';
	import { MenuIcon } from 'lucide-svelte';
	import Logout from './Logout.svelte';

	type PublicNavLink = {
		name: string;
		href: string;
	};

	let {
		buttonClass,
		links,
		adminLinks = []
	}: {
		buttonClass?: string;
		links: PublicNavLink[];
		adminLinks?: AdminNavLink[];
	} = $props();

	let isOpen = $state(false);
</script>

<Sheet.Root bind:open={isOpen}>
	<Sheet.Trigger class={buttonClass}><MenuIcon /></Sheet.Trigger>
	<Sheet.Content class="max-w-[290px]">
		<ul class="mt-8 flex flex-col gap-4 px-6 text-lg">
			{#each links as { name, href }, i}
				<li>
					<a
						class="block"
						{href}
						onclick={() => (isOpen = false)}
						aria-current={href === $page.url.pathname}
						target="_top"
						>{name}
					</a>
				</li>
			{/each}
		</ul>

		{#if adminLinks.length > 0}
			<div class="mt-6 border-t border-slate-200 px-6 pt-5">
				<p class="mb-3 text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">Admin</p>
				<ul class="flex flex-col gap-3 text-base text-slate-700">
					{#each adminLinks as link (link.href)}
						<li>
							<a
								class="flex items-center gap-3 rounded-md py-1"
								href={link.href}
								onclick={() => (isOpen = false)}
								aria-current={link.href === $page.url.pathname}
								target="_top"
							>
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

				<div class="mt-4">
					<Logout />
				</div>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
