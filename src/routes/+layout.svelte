<script lang="ts">
	import Footer from '@/components/Footer.svelte';
	import Nav from '@/components/Nav.svelte';
	import '@fontsource-variable/quicksand';
	import SiWhatsapp from '@icons-pack/svelte-simple-icons/icons/SiWhatsapp';
	import '../app.css';

	import { invalidate } from '$app/navigation';
	import { navigating } from '$app/stores';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children } = $props();
</script>

<div class="slate-200 w-full bg-slate-200/80 text-gray-700">
	<Nav
		links={[
			{ name: 'Inicio', href: '/' },
			{ name: 'Servicios', href: '/servicios' },
			{ name: 'Nosotros', href: '/nosotros' },
			{ name: 'Contacto', href: '/contacto' }
		]}
	/>
	{#if $navigating}
		<div class="fixed top-0 left-0 z-50 h-1 w-full">
			<div class="h-full w-1/3 animate-pulse bg-green-400/80"></div>
		</div>
	{/if}

	<main class="mx-auto mt-[90px] h-full min-h-[calc(100vh-80px-300px)]">
		{@render children?.()}
	</main>

	<a
		href="https://wa.me/59898400860"
		class="fixed right-6 bottom-6 z-50 h-[60px] w-[60px] rounded-full bg-green-500/80 p-[12px] text-white shadow-md backdrop-blur"
	>
		<SiWhatsapp size={36} class="text-white" />
	</a>

	<Footer />
</div>
