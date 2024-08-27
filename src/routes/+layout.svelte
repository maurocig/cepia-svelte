<script>
	// Supports weights 300-700
	import '@fontsource-variable/quicksand';

	import Nav from '$lib/components/Nav.svelte';
	import Footer from '@/components/Footer.svelte';
	import '@fontsource-variable/quicksand';
	import FaWhatsapp from 'svelte-icons/fa/FaWhatsapp.svelte';

	import '../app.css';
</script>

<div class="slate-200 w-full bg-slate-100 text-gray-700">
	<Nav
		links={[
			{ name: 'Inicio', href: '/' },
			{ name: 'Servicios', href: '/servicios' },
			{ name: 'Nosotros', href: '/nosotros' },
			// { name: 'Galería', href: '/galeria' },
			{ name: 'Contacto', href: '/contacto' }
		]}
	/>
	<main class="mx-auto mt-[90px] h-full">
		<slot />
	</main>

	<a
		href="https://wa.me/59898400860"
		class="fixed bottom-6 right-6 z-50 h-[60px] w-[60px] rounded-full bg-green-500/80 p-[12px] text-white shadow-md backdrop-blur"
	>
		<FaWhatsapp class="text-[20px] text-white" />
	</a>

	<Footer />
</div>

<style></style>
