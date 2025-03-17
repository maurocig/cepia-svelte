<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<h1 class="mb-2 text-3xl font-semibold text-gray-700">{@render children?.()}</h1>
