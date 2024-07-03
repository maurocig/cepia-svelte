<script lang="ts">
	import Card from './Card.svelte';

	export let image = '';
	export let showArrow = false;
	export let title = '';
	export let description = '';
</script>

<div
	class="h-full w-full overflow-hidden rounded-lg bg-cover bg-center shadow-sm transition hover:shadow-md"
	style="background-image: url({image});"
>
	<Card
		{title}
		{showArrow}
		className="h-full md:from-white/70 hover:bg-white/20 md:bg-transparent md:backdrop-blur-0 md:bg-gradient-to-b md:to-emerald-200/40 md:via-white/30 duration-700 border-slate-900/20 hover:border-slate-900/20 hover:backdrop-blur-lg transition group"
	>
		<p class="group text-[17px] transition duration-700 group-hover:opacity-100 md:opacity-0">
			{description}
		</p>
	</Card>
</div>
