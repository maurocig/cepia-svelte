<script lang="ts">
	import { navigating, page } from '$app/stores';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Menu, MenuIcon } from 'lucide-svelte';

	export let buttonClass;
	export let links;

	let isOpen = false;
	// $: if (navigating) isOpen = false;
</script>

<Sheet.Root bind:open={isOpen}>
	<Sheet.Trigger class={buttonClass}><MenuIcon /></Sheet.Trigger>
	<Sheet.Content class="max-w-[250px]">
		<ul class="flex flex-col gap-4 px-6 text-lg">
			{#each links as { name, href }, i}
				<li>
					<a
						{href}
						on:click={() => (isOpen = false)}
						class:active-nav-link={href === $page.url.pathname}
						class="active:text-gray-300">{name}</a
					>
				</li>
			{/each}
		</ul>
	</Sheet.Content>
</Sheet.Root>
