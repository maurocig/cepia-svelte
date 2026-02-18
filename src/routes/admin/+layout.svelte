<script>
	import { goto } from '$app/navigation';
	import AdminSidebar from '@/components/AdminSidebar.svelte';
	import Logout from '@/components/Logout.svelte';
	import { CircleUserRoundIcon, HomeIcon, LogOutIcon, UserIcon, UsersIcon } from 'lucide-svelte';
	import { Toaster } from 'svelte-french-toast';

	let { children, data } = $props();
</script>

<div
	class="mx-auto flex min-h-[calc(100vh-80px-300px)] w-full max-w-[1280px] grid-cols-2 flex-row items-start gap-4 px-4 md:gap-6 xl:px-0"
>
	<AdminSidebar
		userEmail={data.user?.email ?? ''}
		links={[
			{ href: '/admin', label: 'Inicio' },
			{ href: '/admin/pacientes', label: 'Pacientes', rightText: String(data.patientsCount ?? 0) },
			{ href: '/admin/pacientes/nuevo', label: 'Ingresar paciente' }
		]}
	/>

	<main class="h-fit w-full rounded-lg bg-white/70 shadow-md md:min-h-[300px] md:p-6 lg:p-8">
		{@render children()}
	</main>
</div>

<Toaster
	position="top-center"
	gutter={12}
	containerStyle="top: 28px;"
	toastOptions={{
		duration: 3000,
		style: 'font-size: 15px; padding: 12px 14px; min-width: 340px;'
	}}
/>
