<script>
	export let href = '';
	export let title = '';
	export let showArrow = true;
	export let className = '';
</script>

<div
	class="group flex h-full flex-col gap-4 rounded-lg border bg-gradient-to-b from-white/70 to-white/40 p-4 shadow-sm transition-all duration-500 hover:border-gray-900/10 hover:bg-white/20 hover:shadow-md hover:backdrop-blur-lg md:p-4 lg:p-8 {className}"
>
	<div class="space-y-3">
		<h2
			class="flex items-center gap-2 text-[1.4rem] font-semibold drop-shadow-lg transition-transform duration-500 ease-in-out"
		>
			{title}
			{#if showArrow}
				<span class="transition duration-300 ease-in-out group-hover:translate-x-2">&rarr;</span>
			{/if}
		</h2>
		<div class="h-full">
			<p class="">
				<!-- {body} -->
				<slot />
			</p>
		</div>
	</div>
</div>
