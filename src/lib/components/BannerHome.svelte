<script>
	import Carousel from './Carousel.svelte';
	import ImageBlock from './ImageBlock.svelte';

	import { featuredImages, images } from '$lib/images';
	import { shuffle } from '$lib/utils';
</script>

<div
	class="banner-home relative hidden h-[500px] w-full grid-cols-2 grid-rows-2 gap-4 md:grid md:grid-cols-3 md:grid-rows-3 lg:grid-cols-5"
>
	<div class="bg-blue-500 drop-shadow-lg md:row-span-2">
		<ImageBlock imgs={images} />
	</div>
	<div class="bg-green-500 drop-shadow-md md:col-span-2">
		<ImageBlock imgs={images} />
	</div>
	<div class="bg-yellow-500 drop-shadow-md">
		<ImageBlock imgs={images} />
	</div>
	<div class="row-span-2 bg-indigo-500 drop-shadow-md lg:row-span-1">
		<ImageBlock imgs={images} />
	</div>
	<div class="bg-blue-500 drop-shadow-md">
		<ImageBlock imgs={images} />
	</div>
	<div class="bg-red-500 drop-shadow-md lg:col-span-2 lg:row-span-2">
		<ImageBlock imgs={featuredImages} isFeatured />
	</div>
	<div class="row-span-2 hidden bg-yellow-500 drop-shadow-md lg:block">
		<ImageBlock imgs={images} />
	</div>
	<div class="hidden bg-red-500 drop-shadow-md lg:block">
		<ImageBlock imgs={images} />
	</div>
	<div class="hidden bg-green-500 drop-shadow-md lg:block">
		<ImageBlock imgs={images} />
	</div>
</div>

<style>
</style>
