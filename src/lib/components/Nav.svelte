<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Sheet from '$lib/components/ui/sheet';
	import { LogOutIcon } from 'lucide-svelte';
	import MobileMenu from './MobileMenu.svelte';
	import NavLogo from './NavLogo.svelte';
	import { getUserState } from './state/user-state.svelte';

	let { links, data } = $props();

	let userContext = getUserState();
	let { user, supabase } = $derived(userContext);

	// const logout = async () => {
	// 	const { error } = await supabase!.auth.signOut();
	// 	if (error) {
	// 		console.error(error);
	// 	} else {
	// 		goto('/login');
	// 	}
	// };
</script>

<nav
	class="fixed top-0 z-50 w-full border-b border-gray-900/10 bg-white px-4 shadow-sm backdrop-blur"
>
	<div class="mx-auto flex h-[70px] w-full max-w-[1280px] items-center justify-between">
		<NavLogo />

		<MobileMenu buttonClass="block md:hidden" {links} />
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
			{#if user}
				<button
					onclick={() => userContext.logout()}
					class="flex items-center gap-2 rounded-md text-start text-red-700 transition hover:opacity-60"
					><LogOutIcon size="16" /> Salir</button
				>
			{:else}
				<a
					href={'/login'}
					class="flex items-center gap-2 rounded-md text-start transition hover:opacity-60"
				>
					Login
				</a>
			{/if}
		</ul>
	</div>
</nav>

<!-- <style>
			li a[aria-current='true'] {
			@apply border-b-2 border-gray-600;
		}
</style> -->
