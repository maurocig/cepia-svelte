<script lang="ts">
	import { page } from '$app/stores';
	import type { AdminNavLink } from '$lib/server/admin-nav';
	import MobileMenu from './MobileMenu.svelte';
	import NavLogo from './NavLogo.svelte';

	type PublicNavLink = {
		name: string;
		href: string;
	};

	let {
		links,
		adminLinks = []
	}: {
		links: PublicNavLink[];
		adminLinks?: AdminNavLink[];
	} = $props();
</script>

<nav
	class="fixed top-0 z-50 w-full border-b border-gray-900/10 bg-white/80 px-4 shadow-sm backdrop-blur"
>
	<div class="mx-auto flex h-[70px] w-full max-w-[1280px] items-center justify-between">
		<NavLogo />

		<MobileMenu buttonClass="block md:hidden" {links} {adminLinks} />
		<ul class="font-quicksand hidden gap-6 font-normal text-gray-600 md:flex">
			{#each links as { name, href }, i}
				<li>
					<a
						class="drop-shadow-sm transition hover:opacity-70"
						{href}
						aria-current={href === $page.url.pathname}>{name}</a
					>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<!-- <style>
			li a[aria-current='true'] {
			@apply border-b-2 border-gray-600;
		}
</style> -->
