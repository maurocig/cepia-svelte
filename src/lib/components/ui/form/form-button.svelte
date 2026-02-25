<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	interface Props {
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { children, ...rest }: Props = $props();
</script>

<Button.Root type="submit" {...rest}>
	{@render children?.()}
</Button.Root>
