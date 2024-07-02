<script lang="ts">
	type ImageType = {
		title: string;
		src: string;
	};

	export const images: ImageType[] = [];
</script>

<ul class="flex">
	{#each images as { title, src }}
		<li class="shrink-0">
			<img {src} {title} alt={title} />
		</li>
	{/each}
</ul>
