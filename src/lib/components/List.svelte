<script lang="ts">
	import { Check, Dot, Plus } from 'lucide-svelte';

	export let items: string[] = [];
	export let dot = false;
</script>

<ul class="flex flex-col gap-4 md:ml-4">
	{#each items as item}
		<li class="flex items-start gap-3">
			{#if dot}
				<Dot class="min-w-[18px] shrink-0 text-emerald-500" strokeWidth={5} size={22} />
			{:else}
				<Check class="min-w-[18px] text-emerald-500" strokeWidth={3} size={18} />
			{/if}
			<span>{item}</span>
		</li>
	{/each}
</ul>
