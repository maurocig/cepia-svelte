<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import X from "lucide-svelte/icons/x";
	import {
		SheetOverlay,
		SheetPortal,
		type Side,
		sheetVariants,
	} from "./index.js";
	import { cn } from "$lib/utils.js";

	type $$Props = SheetPrimitive.ContentProps & {
		side?: Side;
	};

	
	interface Props {
		class?: $$Props["class"];
		side?: $$Props["side"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		class: className = undefined,
		side = "right",
		children,
		...rest
	}: Props = $props();
</script>

<SheetPortal>
	<SheetOverlay />
	<SheetPrimitive.Content
		class={cn(sheetVariants({ side }), className)}
		{...rest}
	>
		{@render children?.()}
		<SheetPrimitive.Close
			class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
		>
			<X class="h-4 w-4" />
			<span class="sr-only">Close</span>
		</SheetPrimitive.Close>
	</SheetPrimitive.Content>
</SheetPortal>
