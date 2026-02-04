<script lang="ts">
	import { setUserState } from '@/components/state/user-state.svelte';

	// Supports weights 300-700
	import Footer from '@/components/Footer.svelte';
	import Nav from '@/components/Nav.svelte';
	import '@fontsource-variable/quicksand';
	import FaWhatsapp from 'svelte-icons/fa/FaWhatsapp.svelte';

	import '../app.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	// SUPABASE: listener for Auth events on the client, to handle session refreshes and signouts.
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	let userState = setUserState({ session: data.session, supabase: data.supabase, user: data.user });

	$effect(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			userState.updateState({ session: newSession, supabase, user: newSession?.user || null });

			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div class="slate-200 w-full bg-slate-100 text-gray-700">
	<Nav
		{data}
		links={[
			{ name: 'Inicio', href: '/' },
			{ name: 'Servicios', href: '/servicios' },
			{ name: 'Nosotros', href: '/nosotros' },
			// { name: 'Galería', href: '/galeria' },
			{ name: 'Contacto', href: '/contacto' }
		]}
	/>

	<main class="mx-auto mt-[90px] h-full min-h-[calc(100vh-80px-300px)]">
		{@render children?.()}
	</main>

	<a
		href="https://wa.me/59898400860"
		class="fixed bottom-6 right-6 z-50 h-[60px] w-[60px] rounded-full bg-green-500/80 p-[12px] text-white shadow-md backdrop-blur"
	>
		<FaWhatsapp class="text-[20px] text-white" />
	</a>

	<Footer />
</div>
