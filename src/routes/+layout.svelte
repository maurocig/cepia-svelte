<script>
	// Supports weights 300-700
	import '@fontsource-variable/quicksand';

	import Nav from '$lib/components/Nav.svelte';
	import Footer from '@/components/Footer.svelte';
	import '@fontsource-variable/quicksand';
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

	<Footer />
</div>

<style></style>
