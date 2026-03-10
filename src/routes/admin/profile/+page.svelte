<script lang="ts">
	import { formatDateUy, formatPersonName } from '$lib/utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const dateFromDateTime = (value?: Date | string | null) => {
		if (!value) return '-';
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) return '-';
		return date.toISOString().slice(0, 10);
	};
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-xl font-semibold">Mi perfil</h1>
		<p class="mt-1 text-sm text-slate-600">Información de cuenta y actividad de carga de pacientes.</p>
	</div>

	<section class="rounded-md border p-4 lg:p-6">
		<dl class="grid gap-4 text-sm md:grid-cols-2">
			<div>
				<dt class="font-medium">Nombre</dt>
				<dd>{data.profile.name || '-'}</dd>
			</div>
			<div>
				<dt class="font-medium">Email</dt>
				<dd>{data.profile.email || '-'}</dd>
			</div>
			<div>
				<dt class="font-medium">Rol</dt>
				<dd>{data.profile.role}</dd>
			</div>
			<div>
				<dt class="font-medium">Cuenta creada</dt>
				<dd>{formatDateUy(dateFromDateTime(data.profile.createdAt))}</dd>
			</div>
		</dl>
	</section>

	<section class="grid gap-4 md:grid-cols-2">
		<div class="rounded-md border p-4 lg:p-6">
			<p class="text-xs font-medium tracking-wide text-slate-500 uppercase">Pacientes agregados</p>
			<p class="mt-2 text-2xl font-semibold text-slate-800">{data.stats.patientsCreatedCount}</p>
		</div>
		<div class="rounded-md border p-4 lg:p-6">
			<p class="text-xs font-medium tracking-wide text-slate-500 uppercase">Último paciente agregado</p>
			<p class="mt-2 text-2xl font-semibold text-slate-800">
				{formatDateUy(dateFromDateTime(data.stats.lastCreatedAt))}
			</p>
		</div>
	</section>

	<section class="rounded-md border">
		<header class="border-b px-4 py-3">
			<h2 class="text-sm font-semibold tracking-wide text-slate-600 uppercase">Últimos 10 pacientes agregados</h2>
		</header>

		{#if data.recentPatients.length === 0}
			<p class="px-4 py-4 text-sm text-slate-600">Todavía no agregaste pacientes completados.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[680px] text-sm">
					<thead class="bg-slate-50 text-left text-slate-600">
						<tr>
							<th class="px-4 py-3 font-medium">Paciente</th>
							<th class="px-4 py-3 font-medium">Documento</th>
							<th class="px-4 py-3 font-medium">Fecha de carga</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentPatients as row (row.enrollmentId)}
							<tr class="border-t">
								<td class="px-4 py-3">
									<a
										href={`/admin/pacientes/${row.enrollmentId}`}
										class="font-medium text-slate-800 underline-offset-2 hover:underline"
									>
										{formatPersonName(`${row.enrolledFirstName} ${row.enrolledLastName}`)}
									</a>
								</td>
								<td class="px-4 py-3 text-slate-700">{row.enrolledIdType} {row.enrolledIdNumber}</td>
								<td class="px-4 py-3 text-slate-700">
									{formatDateUy(dateFromDateTime(row.createdAt))}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>

