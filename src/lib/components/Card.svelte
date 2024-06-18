<script>
	export let href = '';
	export let title = '';
</script>

<div
	class="flex flex-col gap-4 rounded-lg border p-4 transition-all duration-500 hover:border-gray-900/10 hover:bg-white/30 hover:shadow-sm lg:p-6"
>
	<a {href} class="space-y-3">
		<h2 class="text-xl font-bold">
			{title}
			<span>&rarr;</span>
		</h2>
		<div class="h-full">
			<p class="">
				<!-- {body} -->
				<slot />
			</p>
		</div>
	</a>
</div>
