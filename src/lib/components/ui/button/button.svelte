<script lang="ts">
	import { Button as ButtonPrimitive } from "bits-ui";
	import { type VariantProps } from "tailwind-variants";
	import { buttonVariants } from "./index.js";
	import { cn } from "$lib/utils.js";

	type Variant = VariantProps<typeof buttonVariants>["variant"];
	type Size = VariantProps<typeof buttonVariants>["size"];

	interface Props_1 {
		class?: string;
		variant?: Variant;
		size?: Size;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		class: className = undefined,
		variant = "default",
		size = "default",
		children,
		...rest
	}: Props_1 = $props();
	
</script>

<ButtonPrimitive.Root
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...rest}
>
	{@render children?.()}
</ButtonPrimitive.Root>
