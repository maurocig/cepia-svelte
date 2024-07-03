<script lang="ts">
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { blur, crossfade, fade, slide } from 'svelte/transition';

	type ImageType = {
		title: string;
		src: string;
	};

	export let imgs: ImageType[];
	export let delay = 2000;
	export let delayStart = false;

	let src = '/img/chenga-colores.jpg';
	let alt = 'Niño jugando Jenga';

	function getRandomColor() {
		let colors = ['indigo', 'green', 'red', 'blue', 'yellow'];
		let index = getRandomIndex(colors.length - 1);
		return colors[index];
	}

	function getRandomIndex(max: number) {
		return Math.round(Math.random() * max);
	}

	let show = true;
	let currentIndex = 0;

	onMount(() => {
		const intervalId = setInterval(
			() => {
				currentIndex < imgs.length - 1 ? (currentIndex += 1) : (currentIndex = 0);
				// currentIndex = getRandomIndex(imgs.length - 1);
				// show = false;
			},
			delay + getRandomIndex(2000)
		);
		return () => {
			clearInterval(intervalId);
			delayStart = false;
		};
	});
</script>

<div class="relative h-full w-full">
	{#if currentIndex % 2 === 0 && getRandomIndex(10) < 6}
		<img
			transition:fade={{ duration: 2000, easing: quintOut }}
			src={imgs[getRandomIndex(imgs.length - 1)].src}
			alt={imgs[currentIndex].title}
			class="absolute h-full w-full object-cover transition"
		/>
	{:else}
		<div
			transition:fade={{ duration: 1000, easing: quintOut }}
			class="h-full w-full bg-{getRandomColor()}-500 absolute shadow-inner"
		></div>
	{/if}
</div>

<style>
</style>
