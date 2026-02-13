<script>
	import { goto } from '$app/navigation';
	import AdminSidebar from '@/components/AdminSidebar.svelte';
	import Logout from '@/components/Logout.svelte';
	import { CircleUserRoundIcon, HomeIcon, LogOutIcon, UserIcon, UsersIcon } from 'lucide-svelte';

	let { children, data } = $props();
</script>

<div
	class="mx-auto flex min-h-[calc(100vh-80px-300px)] w-full max-w-[1280px] grid-cols-2 flex-row gap-4 px-4 md:gap-6 xl:px-0"
>
	<AdminSidebar
		userEmail={data.user.email}
		links={[
			{ href: '/admin', label: 'Inicio' },
			{ href: '/admin/pacientes', label: 'Pacientes' },
			{ href: '/admin/pacientes/nuevo', label: 'Ingresar paciente' }
		]}
	/>

	<main class="h-fit w-full rounded-lg bg-white/70 shadow-md md:min-h-[300px] md:p-6 lg:p-8">
		{@render children()}
	</main>
</div>
