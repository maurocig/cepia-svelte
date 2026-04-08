<script lang="ts">
	import { page } from '$app/state';
	import Button from '@/components/ui/button/button.svelte';

	const isPatientNotFound = $derived(
		page.status === 404 || page.error?.message === 'Paciente no encontrado'
	);
	const title = $derived(
		isPatientNotFound ? 'No se encontró el paciente' : 'No se pudo abrir la ficha'
	);
	const description = $derived(
		isPatientNotFound
			? 'La incripción puede haber sido borrada, el enlace puede ser viejo o la ficha ya no estar disponible.'
			: page.error?.message || 'Ocurrió un problema al cargar la ficha del paciente.'
	);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="flex items-start pt-0 pb-6 md:pb-8">
	<section class="w-full rounded-lg border border-slate-900/15 bg-white/85 p-6 shadow-sm md:p-8">
		<p class="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
			{isPatientNotFound ? 'Paciente no encontrado' : `Error ${page.status}`}
		</p>
		<h1 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>

		<div class="mt-6 flex flex-wrap gap-3">
			<Button href="/admin/pacientes">Volver a pacientes</Button>
			<Button href="/admin" variant="outline">Ir al panel</Button>
		</div>
	</section>
</div>
