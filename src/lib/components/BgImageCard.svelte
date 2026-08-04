<script lang="ts">
	import Card from './Card.svelte';

	interface Props {
		image?: string;
		showArrow?: boolean;
		title?: string;
		description?: string;
	}

	let {
		image = '',
		showArrow = false,
		title = '',
		description = ''
	}: Props = $props();
</script>

<div
	class="h-full w-full overflow-hidden rounded-lg bg-cover bg-center shadow-sm transition hover:shadow-md"
	style="background-image: url({image});"
>
	<Card
		{title}
		{showArrow}
		className="group h-full md:from-white/70 md:backdrop-blur-0 md:bg-gradient-to-b md:to-emerald-200/50 md:via-white/30 border-slate-900/20 duration-700 transition hover:border-slate-900/60 hover:bg-white/20 hover:bg-opacity-0 hover:backdrop-blur-xl focus-within:border-slate-900/60 focus-within:bg-white/20 focus-within:bg-opacity-0 focus-within:backdrop-blur-xl"
	>
		<p
			class="text-[17px] text-lg text-slate-800 opacity-0 drop-shadow-sm transition duration-700 group-hover:opacity-100 group-focus-within:opacity-100"
		>
			{description}
		</p>
	</Card>
</div>
