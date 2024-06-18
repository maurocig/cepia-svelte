<script lang="ts">
	import { page } from '$app/stores';
	import MobileMenu from './MobileMenu.svelte';
	import NavLogo from './NavLogo.svelte';

	export let links;
</script>

<nav
	class="fixed top-0 z-50 w-full border-b border-gray-900/10 bg-white/90 px-4 shadow-sm backdrop-blur"
>
	<div class="mx-auto flex h-[70px] w-full max-w-[1280px] items-center justify-between">
		<NavLogo />
		<script lang="ts">
			import * as Sheet from '$lib/components/ui/sheet';
		</script>

		<MobileMenu buttonClass="block md:hidden" {links} />
		<ul class="font-quicksand hidden gap-6 font-normal text-gray-600 md:flex">
			{#each links as { name, href }, i}
				<li>
					<a
						class="drop-shadow-sm transition hover:opacity-70"
						{href}
						class:active-nav-link={href === $page.url.pathname}>{name}</a
					>
				</li>
			{/each}
		</ul>
	</div>
</nav>
