<script>
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '@/components/Footer.svelte';
	import '@fontsource-variable/quicksand';
	import '../app.css';
</script>

<div class="slate-200 h-full w-full bg-slate-100">
	<Nav
		links={[
			{ name: 'Inicio', href: '/' },
			{ name: 'Servicios', href: '/servicios' },
			{ name: 'Nosotros', href: '/nosotros' },
			{ name: 'Galería', href: '/galeria' },
			{ name: 'Contacto', href: '/contacto' }
		]}
	/>
	<main class="mx-auto mt-[90px] h-full">
		<slot />
	</main>

	<Footer />
</div>

<style></style>
