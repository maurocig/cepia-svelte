<script>
	import Nav from '$lib/components/Nav.svelte';
	import '@fontsource-variable/quicksand';
	import '../app.css';
</script>

<div class="slate-200 h-full w-full bg-slate-100">
	<Nav
		links={[
			{ name: 'Inicio', href: '/' },
			{ name: 'Servicios', href: '/servicios' },
			{ name: 'Nosotros', href: '/nosotros' },
			{ name: 'Prestadores', href: '/prestadores' },
			{ name: 'Contacto', href: '/contacto' }
		]}
	/>
	<main class="mx-auto mt-[100px] h-full">
		<slot />
	</main>
</div>

<style></style>
