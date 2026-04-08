<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '@/components/ui/button/button.svelte';
	import { Plus, Users } from 'lucide-svelte';
	import { toast } from 'svelte-french-toast';
	import type { PageData } from './$types';
	import { columns } from './columns';
	import DataTable from './data-table.svelte';

	let { data }: { data: PageData } = $props();
	let savedToastShown = $state(false);
	let deletedToastShown = $state(false);

	$effect(() => {
		if (savedToastShown) return;
		if ($page.url.searchParams.get('saved') !== '1') return;
		savedToastShown = true;
		toast.success('Paciente guardado correctamente.');
		void goto($page.url.pathname, { replaceState: true, noScroll: true, keepFocus: true });
	});

	$effect(() => {
		if (deletedToastShown) return;
		if ($page.url.searchParams.get('deleted') !== '1') return;
		deletedToastShown = true;
		toast.success('Paciente eliminado correctamente.');
		void goto($page.url.pathname, { replaceState: true, noScroll: true, keepFocus: true });
	});
</script>

<div class="space-y-6">
	<section class="rounded-lg border border-slate-900/15 bg-linear-to-br from-white via-white to-slate-100/70 p-4 shadow-sm md:p-5">
		<div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
			<div class="max-w-2xl space-y-3">
				<p class="mb-1 text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
					Pacientes
				</p>
				<div class="space-y-1">
					<h1 class="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
						Listado general
					</h1>
					<p class="text-sm text-slate-500">
						Consultá, filtrá y abrí rápidamente las fichas cargadas.
					</p>
				</div>
				<div class="flex flex-col gap-2.5 sm:flex-row">
					<Button href="/admin/pacientes/nuevo" class="gap-2">
						<Plus size={18} />
						Ingresar paciente
					</Button>
				</div>
			</div>

			<div class="hidden rounded-lg border border-slate-900/15 bg-white/85 p-4 shadow-sm md:block md:w-[240px]">
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="text-3xl font-semibold tracking-tight text-slate-900">
							{data.patients.length}
						</p>
						<p class="mt-2 text-sm text-slate-500">pacientes cargados</p>
					</div>
					<div class="rounded-md bg-slate-100 p-2 text-slate-700">
						<Users size={18} />
					</div>
				</div>
			</div>
		</div>
	</section>

	<DataTable data={data.patients} {columns} />
</div>
