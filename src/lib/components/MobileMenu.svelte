<script lang="ts">
	import { afterNavigate, disableScrollHandling } from '$app/navigation';
	import { navigating, page } from '$app/stores';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Menu, MenuIcon } from 'lucide-svelte';

	export let buttonClass;
	export let links;

	let isOpen = false;

	// // this is a good fix for scroll to top but breaks the links to specific # id scroll locations.
	// // using target="_top" for each ancher tag instead.
	// afterNavigate(() => {
	// 	disableScrollHandling();
	// 	setTimeout(() => {
	// 		scrollTo({ top: 0, behavior: 'instant' });
	// 	}, 200);
	// });
</script>

<Sheet.Root bind:open={isOpen}>
	<Sheet.Trigger class={buttonClass}><MenuIcon /></Sheet.Trigger>
	<Sheet.Content class="max-w-[250px]">
		<ul class="mt-8 flex flex-col gap-4 px-6 text-lg">
			{#each links as { name, href }, i}
				<li>
					<a
						{href}
						on:click={() => (isOpen = false)}
						aria-current={href === $page.url.pathname}
						target="_top"
						>{name}
					</a>
				</li>
			{/each}
		</ul>
	</Sheet.Content>
</Sheet.Root>

<style>
	li a[aria-current='true'] {
		@apply border-b-2 border-gray-600;
	}
</style>
