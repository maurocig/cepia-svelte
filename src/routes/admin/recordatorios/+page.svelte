<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { formatDateUy, formatPersonName } from '$lib/utils';
	import { Clock3 } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const expirationBadgeClass = (status: string) => {
		if (status === 'active') return 'bg-emerald-100 text-emerald-700';
		if (status === 'expired') return 'bg-rose-100 text-rose-700';
		return 'bg-amber-100 text-amber-700';
	};
	const expirationLabel = (status: string, daysUntil: number) => {
		if (status === 'active') return `En ${Math.max(daysUntil, 0)} dias`;
		if (status === 'expired') return 'Vencido';
		return `En ${Math.max(daysUntil, 0)} dias`;
	};
</script>

<h1 class="text-xl font-semibold">Recordatorios</h1>
<p class="mt-2 text-sm text-slate-600">
	Se listan convenios BPS con recordatorios automáticos a 90 y 30 días previos al vencimiento.
</p>

{#if data.reminders.length === 0}
	<section class="mt-4 rounded-md border p-4">
		<p class="text-sm text-slate-600">No hay convenios BPS con vencimiento configurado.</p>
	</section>
{:else}
	<Tooltip.Provider delayDuration={120}>
		<section class="mt-4 overflow-x-auto rounded-md border">
			<table class="w-full min-w-[980px] text-sm">
				<thead class="bg-slate-50 text-left text-slate-600">
					<tr class="border-b">
						<th class="px-3 py-3 font-medium whitespace-nowrap">Paciente</th>
						<th class="px-3 py-3 font-medium whitespace-nowrap">Documento</th>
						<th class="px-3 py-3 font-medium whitespace-nowrap">Vence convenio</th>
						<th class="px-2 py-3 text-center font-medium whitespace-nowrap">Rec. 90 días</th>
						<th class="px-2 py-3 text-center font-medium whitespace-nowrap">Rec. 30 días</th>
						<th class="px-3 py-3 font-medium whitespace-nowrap">Titular</th>
						<th class="px-3 py-3 font-medium whitespace-nowrap">Email titular</th>
					</tr>
				</thead>
				<tbody>
					{#each data.reminders as row (row.enrollmentId)}
						<tr class="border-b last:border-b-0">
							<td class="px-3 py-3">
								<a
									href={`/admin/pacientes/${row.enrollmentId}`}
									class="block max-w-[240px] truncate font-medium whitespace-nowrap text-slate-800 underline-offset-2 hover:underline"
									>{formatPersonName(row.patientName)}</a
								>
							</td>
							<td class="px-3 py-3 whitespace-nowrap text-slate-600">{row.patientDocument}</td>
							<td class="px-3 py-3">
								<Tooltip.Root>
									<Tooltip.Trigger class="inline-flex items-center">
										<span
											class={'rounded-full px-2 py-1 text-xs font-medium ' +
												expirationBadgeClass(row.expirationStatus)}
										>
											{expirationLabel(row.expirationStatus, row.expirationDaysUntil)}
										</span>
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Vence el {formatDateUy(row.expirationDate)}</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</td>
							<td class="px-2 py-3">
								<div class="flex items-center justify-center gap-2">
									{#if row.reminder90.status === 'sent'}
										<Tooltip.Root>
											<Tooltip.Trigger class="inline-flex items-center">
												<span
													class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
													>Enviado</span
												>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Se envió el {formatDateUy(row.reminder90.date)}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									{:else}
										<Tooltip.Root>
											<Tooltip.Trigger class="inline-flex items-center text-slate-500">
												<Clock3 size={16} class="text-slate-400" />
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Se enviará el {formatDateUy(row.reminder90.date)}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									{/if}
								</div>
							</td>
							<td class="px-2 py-3">
								<div class="flex items-center justify-center gap-2">
									{#if row.reminder30.status === 'sent'}
										<Tooltip.Root>
											<Tooltip.Trigger class="inline-flex items-center">
												<span
													class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
													>Enviado</span
												>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Se envió el {formatDateUy(row.reminder30.date)}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									{:else}
										<Tooltip.Root>
											<Tooltip.Trigger class="inline-flex items-center text-slate-500">
												<Clock3 size={16} class="text-slate-400" />
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Se enviará el {formatDateUy(row.reminder30.date)}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									{/if}
								</div>
							</td>
							<td class="px-3 py-3 text-slate-700">
								{row.holderName ? formatPersonName(row.holderName) : '-'}
							</td>
							<td class="px-3 py-3 text-slate-700">{row.holderEmail}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	</Tooltip.Provider>
{/if}
