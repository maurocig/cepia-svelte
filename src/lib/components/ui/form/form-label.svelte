<script lang="ts">
	import { getFormControl } from "formsnap";
	import { cn } from "$lib/utils.js";
	import { Label } from "$lib/components/ui/label/index.js";

	interface Props {
		class?: string;
		children?: import('svelte').Snippet<[any]>;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	

	const { labelAttrs } = getFormControl();
</script>

<Label {...$labelAttrs} class={cn("data-[fs-error]:text-destructive", className)} {...rest}>
	{@render children?.({ labelAttrs, })}
</Label>
