<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/stores';
	import LoadingButton from '@/components/LoadingButton.svelte';
	import { Plus } from 'lucide-svelte';
	import { toast } from 'svelte-french-toast';
	import type { PageData } from './$types';
	import { columns } from './columns';
	import DataTable from './data-table.svelte';

	let { data }: { data: PageData } = $props();
	let savedToastShown = $state(false);

	$effect(() => {
		if (savedToastShown) return;
		if ($page.url.searchParams.get('saved') !== '1') return;
		savedToastShown = true;
		toast.success('Paciente guardado correctamente.');
		void goto($page.url.pathname, { replaceState: true, noScroll: true, keepFocus: true });
	});
</script>

<h1 class="text-xl">Pacientes</h1>

<DataTable data={data.patients} {columns} />
<div class="my-4 flex min-w-full justify-center gap-3">
	<LoadingButton href="/admin/pacientes/nuevo" preloadData="hover" loading={Boolean($navigating)}
		><Plus size={20} /> Nuevo paciente</LoadingButton
	>
</div>
