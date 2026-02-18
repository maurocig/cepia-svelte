<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/stores';
	import LoadingButton from '@/components/LoadingButton.svelte';
	import { Plus } from 'lucide-svelte';
	import { toast } from 'svelte-french-toast';
	import type { PageData } from './$types';

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

{#if data.patients.length === 0}
	<p class="text-muted-foreground text-sm">Todavía no hay pacientes cargados.</p>
{:else}
	<div class="overflow-x-auto rounded-md border">
		<table class="min-w-full text-sm">
			<thead class="bg-muted/40">
				<tr>
					<th class="px-3 py-2 text-left font-medium">Paciente</th>
					<th class="px-3 py-2 text-left font-medium">Documento</th>
					<th class="px-3 py-2 text-left font-medium">Estado inscripción</th>
					<th class="px-3 py-2 text-left font-medium">Fecha inscripción</th>
				</tr>
			</thead>
			<tbody>
				{#each data.patients as row}
					<tr class="border-t">
						<td class="px-3 py-2">{row.enrolledFirstName} {row.enrolledLastName}</td>
						<td class="px-3 py-2">{row.enrolledIdNumber}</td>
						<td class="px-3 py-2">{row.status === 'active' ? 'Activo' : 'Inactivo'}</td>
						<td class="px-3 py-2">{row.admissionDate}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
<div class="my-4 flex min-w-full justify-center gap-3">
	<LoadingButton href="/admin/pacientes/nuevo" preloadData="hover" loading={Boolean($navigating)}
		><Plus size={20} /> Nuevo paciente</LoadingButton
	>
</div>
