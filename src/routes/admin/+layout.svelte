<script>
	import { goto } from '$app/navigation';
	import { getUserState } from '@/components/state/user-state.svelte';
	import { CircleUserRoundIcon, HomeIcon, LogOutIcon, UserIcon, UsersIcon } from 'lucide-svelte';

	let { data, children } = $props();

	let userContext = getUserState();
	let { user, supabase } = $derived(userContext);
</script>

<div
	class="mx-auto flex min-h-[calc(100vh-80px-300px)] w-full max-w-[1280px] grid-cols-2 flex-row gap-4 md:gap-6"
>
	<aside class="flex h-full w-[300px] flex-col gap-1 rounded-lg bg-white p-4 shadow-lg">
		<a
			href="/admin/profile"
			class="flex gap-4 rounded-md p-2 pb-4 text-slate-400 transition hover:bg-gray-200"
		>
			<CircleUserRoundIcon size="22" />
			{user?.email || 'Invitado'}
		</a>
		<ul class="">
			<li>
				<a href="/" class="flex gap-4 rounded-md p-2 transition hover:bg-gray-200"
					><HomeIcon size="22" /> Inicio</a
				>
			</li>
			<li>
				<a href="/admin/pacientes" class="flex gap-4 rounded-md p-2 transition hover:bg-gray-200"
					><UsersIcon size="22" /> Pacientes</a
				>
			</li>
			<button
				onclick={() => console.log('logout')}
				class="flex w-full gap-4 rounded-md p-2 text-start transition hover:bg-gray-200"
				><LogOutIcon size="22" /> Cerrar sesión</button
			>
		</ul>
	</aside>

	<main class="h-fit w-full rounded-lg bg-white shadow-lg md:min-h-[300px] md:p-6 lg:p-8">
		{@render children()}
	</main>
</div>
