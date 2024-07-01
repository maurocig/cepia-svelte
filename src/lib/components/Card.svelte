<script>
	export let href = '';
	export let title = '';
	export let showArrow = true;
	export let className = '';
</script>

<div
	class="group flex flex-col gap-4 rounded-lg border bg-white/70 p-4 transition-all duration-500 hover:border-gray-900/10 hover:bg-white/90 hover:shadow-sm lg:p-8 {className}"
>
	<a {href} class="space-y-3">
		<h2
			class="flex items-center gap-2 text-xl font-bold transition-transform duration-500 ease-in-out"
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
	</a>
</div>
