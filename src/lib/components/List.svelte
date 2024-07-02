<script lang="ts">
	import { Check } from 'lucide-svelte';

	export let items: string[] = [];
</script>

<ul class="flex flex-col gap-4 md:ml-4">
	{#each items as item}
		<li class="flex items-center gap-4">
			<Check class="min-w-[18px] text-emerald-500" strokeWidth={4} size={18} />
			<span>{item}</span>
		</li>
	{/each}
</ul>
