<!-- src/lib/components/common/LoadingButton.svelte -->
<script lang="ts">
	import Button from '@/components/ui/button/button.svelte';

	export let loading = false;
	export let disabled = false;

	// si pasás href, renderiza un <a> adentro del Button (ideal para navegación)
	export let href: string | undefined;
	export let preloadData: 'hover' | 'tap' | 'off' | undefined = 'hover';

	// opcional: clases para el contenido interno
	export let contentClass = '';
</script>

<Button class="p-0" disabled={disabled || loading}>
	{#if href}
		<a
			{href}
			data-sveltekit-preload-data={preloadData}
			class={`flex items-center gap-2 ${contentClass} w-full px-4 py-2`}
		>
			{#if loading}
				<span
					class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					aria-hidden="true"
				/>
				<span class="sr-only">Cargando</span>
			{/if}

			<slot />
		</a>
	{:else}
		<span class={`flex items-center gap-2 ${contentClass}`}>
			{#if loading}
				<span
					class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					aria-hidden="true"
				/>
				<span class="sr-only">Cargando</span>
			{/if}

			<slot />
		</span>
	{/if}
</Button>
