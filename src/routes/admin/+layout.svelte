<script>
	import { page } from '$app/stores';
	import AdminSidebar from '@/components/AdminSidebar.svelte';
	import { Toaster } from 'svelte-french-toast';

	let { children, data } = $props();
	const isBareAdminSurface = $derived(
		$page.url.pathname === '/admin' ||
			$page.url.pathname === '/admin/pacientes' ||
			$page.url.pathname === '/admin/profile' ||
			$page.url.pathname === '/admin/recordatorios' ||
			/^\/admin\/pacientes\/[^/]+\/?$/.test($page.url.pathname)
	);
</script>

<div
	class="3xl:px-0 mx-auto flex min-h-[calc(100vh-80px-300px)] w-full max-w-[1420px] grid-cols-2 flex-row items-start gap-3 px-4 md:gap-4"
>
	<AdminSidebar links={data.adminNav.links} />

	<main
		class={
			'h-fit w-full min-w-0 md:min-h-[300px] ' +
			(isBareAdminSurface
				? 'md:px-1 md:pb-1'
				: 'md:rounded-lg md:bg-white/70 md:p-6 md:shadow-md lg:p-8')
		}
	>
		{@render children()}
	</main>
</div>

<Toaster
	position="top-center"
	gutter={12}
	containerStyle="top: 80px;"
	toastOptions={{
		duration: 3000,
		style: 'font-size: 15px; padding: 12px 14px; min-width: 340px;'
	}}
/>
