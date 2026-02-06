<script lang="ts">
	import Footer from '@/components/Footer.svelte';
	import Nav from '@/components/Nav.svelte';
	import { setUserState } from '@/components/state/user-state.svelte';
	import '@fontsource-variable/quicksand';
	import FaWhatsapp from 'svelte-icons/fa/FaWhatsapp.svelte';
	import '../app.css';

	import { invalidate } from '$app/navigation';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { data, children } = $props();

	const session = $derived(data.session);
	const supabase = $derived(data.supabase);
	const user = $derived(data.user);

	// ✅ crear sin capturar supabase tampoco
	const userState = setUserState({
		session: null,
		supabase: null,
		user: null
	});

	// ✅ setear todo desde effect
	$effect(() => {
		userState.updateState({ session, supabase, user });
	});

	$effect(() => {
		// ✅ este effect corre cuando supabase cambia; si supabase es null al inicio, salimos
		if (!supabase) return;

		const { data: authListener } = supabase.auth.onAuthStateChange((_, newSession) => {
			userState.updateState({
				session: newSession,
				supabase,
				user: newSession?.user || null
			});

			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => authListener.subscription.unsubscribe();
	});
</script>

<div class="slate-200 w-full bg-slate-100 text-gray-700">
	<Nav
		{data}
		links={[
			{ name: 'Inicio', href: '/' },
			{ name: 'Servicios', href: '/servicios' },
			{ name: 'Nosotros', href: '/nosotros' },
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