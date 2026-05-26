<script lang="ts">
	import { goto } from '$app/navigation';
	import { Input } from '$lib/components/ui/input/index.js';
	import { defaultPatientsTableState, patientsTableState } from '$lib/stores/patients-table';
	import { formatDateUy, formatPersonName } from '$lib/utils';
	import Button from '@/components/ui/button/button.svelte';
	import { CalendarClock, Handshake, Plus, Search, UserRound, Users } from 'lucide-svelte';
	import { get } from 'svelte/store';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let patientSearch = $state('');

	function submitPatientSearch(event: SubmitEvent) {
		event.preventDefault();
		const query = patientSearch.trim();
		const currentState = get(patientsTableState);

		patientsTableState.set({
			filterColumnId: query && /^\d/.test(query) ? 'enrolledIdNumber' : 'patientName',
			filterValue: query,
			columnVisibility: currentState.columnVisibility ?? defaultPatientsTableState.columnVisibility,
			sorting: currentState.sorting ?? defaultPatientsTableState.sorting
		});

		void goto('/admin/pacientes');
	}

	const quickActions = [
		{
			label: 'Ingresar paciente',
			description: 'Crear una nueva inscripción completa.',
			href: '/admin/pacientes/nuevo',
			icon: Plus
		},
		{
			label: 'Ver pacientes',
			description: 'Buscar, revisar y editar fichas existentes.',
			href: '/admin/pacientes',
			icon: Users
		},
		{
			label: 'Revisar recordatorios',
			description: 'Controlar convenios próximos a vencer.',
			href: '/admin/recordatorios',
			icon: CalendarClock
		}
	];

	const dashboardSummaryCards = [
		{
			label: 'Pacientes activos',
			value: data.stats.activePatients,
			helper: `${data.stats.totalPatients} en total`,
			icon: Users
		},
		{
			label: 'Vencen en 30 días',
			value: data.stats.upcomingRenewals30d,
			helper: 'Requieren atención',
			icon: CalendarClock
		},
		{
			label: 'Convenios',
			value: data.stats.agreementPatients,
			helper: 'Inscripciones por convenio',
			icon: Handshake
		},
		{
			label: 'Particulares',
			value: data.stats.totalPatients - data.stats.agreementPatients,
			helper: 'Inscripciones particulares',
			icon: UserRound
		}
	];
</script>

<div class="space-y-5">
	<section
		class="overflow-hidden rounded-lg border border-slate-900/15 bg-linear-to-br from-white via-white to-slate-100/70 p-4 shadow-sm md:p-5"
	>
		<div class="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.9fr)] md:items-center">
			<div class="flex h-full flex-col justify-center gap-2.5">
				<p class="mb-1 text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
					Panel administrativo
				</p>
				<h1 class="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
					Resumen general
				</h1>
				<form class="pt-3" onsubmit={submitPatientSearch}>
					<div class="md:max-w-md">
						<div
							class="flex h-11 min-w-0 overflow-hidden rounded-md border border-slate-900/20 bg-white/95 shadow-md shadow-slate-200/70"
						>
							<Input
								bind:value={patientSearch}
								autofocus
								placeholder="Buscar paciente por nombre o documento"
								class="h-11 flex-1 rounded-none border-0 bg-transparent px-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-0"
							/>
							<div class="w-px bg-slate-900/15"></div>
							<Button
								type="submit"
								variant="ghost"
								class="h-11 rounded-none px-4 text-sm text-slate-700 hover:bg-slate-50"
							>
								<Search size={15} class="mr-2" />
								Buscar
							</Button>
						</div>
					</div>
				</form>
			</div>

			<div
				class="hidden rounded-lg border border-slate-900/15 bg-white/85 p-3.5 shadow-sm md:block"
			>
				<p class="text-sm font-medium text-slate-500">Hoy</p>
				<p class="mt-1 text-lg font-semibold text-slate-900">{formatDateUy(data.today)}</p>
				<div class="mt-3 grid grid-cols-2 gap-2">
					<div class="rounded-md bg-slate-100/80 p-2">
						<p class="text-xs text-slate-500 uppercase">Activos</p>
						<p class="mt-1 text-xl font-semibold text-slate-900">{data.stats.activePatients}</p>
					</div>
					<div class="rounded-md bg-amber-50 p-2">
						<p class="text-xs text-amber-700 uppercase">Vencen pronto</p>
						<p class="mt-1 text-xl font-semibold text-amber-900">
							{data.stats.upcomingRenewals30d}
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="grid gap-4 xl:grid-cols-2">
		<div class="rounded-lg border border-slate-900/15 bg-white/80 p-3.5 shadow-sm md:p-4">
			<div class="mb-3.5">
				<h2 class="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
				<p class="text-sm text-slate-500">Tareas frecuentes para arrancar más rápido.</p>
			</div>
			<div class="space-y-2.5">
				{#each quickActions as action (action.href)}
					<a
						href={action.href}
						class="flex items-start gap-3 rounded-lg border border-slate-900/15 bg-white px-3 py-3 transition hover:border-slate-300 hover:bg-slate-50"
					>
						<div class="rounded-md bg-slate-100 p-2 text-slate-700">
							<action.icon size={18} />
						</div>
						<div>
							<p class="font-medium text-slate-900">{action.label}</p>
							<p class="text-xs text-slate-500">{action.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<div class="grid grid-cols-2 gap-3">
			{#each dashboardSummaryCards as card (card.label)}
				<div
					class="flex min-h-[152px] flex-col rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm"
				>
					<div class="flex items-start justify-between gap-3">
						<div>
							<p class="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
								{card.label}
							</p>
						</div>
						<div class="rounded-md bg-slate-100 p-2 text-slate-700">
							<card.icon size={18} />
						</div>
					</div>
					<div class="flex flex-1 items-center">
						<p class="text-3xl font-semibold tracking-tight text-slate-900">
							{card.value}
						</p>
					</div>
					<p class="mt-auto text-sm text-slate-500">{card.helper}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="grid gap-4 xl:grid-cols-2 xl:items-start">
		<div class="rounded-lg border border-slate-900/15 bg-white/80 p-3.5 shadow-sm md:p-4">
			<div class="mb-3.5 flex items-center justify-between gap-3">
				<div>
					<h2 class="text-lg font-semibold text-slate-900">Pacientes recientes</h2>
					<p class="text-sm text-slate-500">Últimos movimientos dentro del panel.</p>
				</div>
				<Button href="/admin/pacientes" variant="outline" size="sm">Ver todos</Button>
			</div>

			{#if data.recentPatients.length > 0}
				<div class="flex flex-col gap-2.5">
					{#each data.recentPatients as patient (patient.enrollmentId)}
						<a
							href={`/admin/pacientes/${patient.enrollmentId}`}
							class="block rounded-lg border border-slate-900/15 bg-white px-3 py-2.5 transition hover:border-slate-300 hover:bg-slate-50"
						>
							<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div class="min-w-0">
									<p class="truncate font-medium text-slate-900">
										{formatPersonName(patient.enrolledFirstName)}{' '}
										{formatPersonName(patient.enrolledLastName)}
									</p>
									<p class="text-sm text-slate-500">
										Alta: {formatDateUy(patient.admissionDate)} ·{' '}
										{patient.admissionMode === 'agreement' ? 'Convenio' : 'Particular'}
									</p>
								</div>
								<div class="flex items-center gap-2 text-sm">
									<span
										class={'rounded-full px-2.5 py-1 font-medium ' +
											(patient.status === 'active'
												? 'bg-emerald-100 text-emerald-700'
												: 'bg-slate-200 text-slate-700')}
									>
										{patient.status === 'active' ? 'Activo' : 'Inactivo'}
									</span>
									<span class="text-slate-400">Actualizado</span>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
				>
					Todavía no hay pacientes cargados para mostrar.
				</div>
			{/if}
		</div>

		<div class="rounded-lg border border-slate-900/15 bg-white/80 p-3.5 shadow-sm md:p-4">
			<div class="mb-3.5 flex items-center justify-between gap-3">
				<div>
					<h2 class="text-lg font-semibold text-slate-900">Próximos vencimientos</h2>
					<p class="text-sm text-slate-500">Hasta 5 registros dentro de los próximos 90 días.</p>
				</div>
				<Button href="/admin/recordatorios" variant="outline" size="sm">Abrir</Button>
			</div>

			{#if data.upcomingExpirations.length > 0}
				<div class="flex flex-col gap-2.5">
					{#each data.upcomingExpirations as item (item.enrollmentId)}
						<a
							href={`/admin/pacientes/${item.enrollmentId}`}
							class="block rounded-lg border border-slate-900/15 bg-white px-3 py-2.5 transition hover:border-slate-300 hover:bg-slate-50"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="truncate font-medium text-slate-900">
										{formatPersonName(item.enrolledFirstName)}{' '}
										{formatPersonName(item.enrolledLastName)}
									</p>
									<p class="truncate text-sm text-slate-500">
										Titular: {formatPersonName(item.holderFirstName)}{' '}
										{formatPersonName(item.holderLastName)}
									</p>
								</div>
								<div class="text-right">
									<p class="text-sm font-medium text-slate-900">
										{formatDateUy(item.expirationDate)}
									</p>
									<p
										class={'mt-1 text-sm ' +
											((item.daysUntil ?? 0) <= 7 ? 'text-rose-600' : 'text-amber-700')}
									>
										{#if (item.daysUntil ?? 0) < 0}
											Vencido
										{:else}
											En {item.daysUntil} días
										{/if}
									</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
				>
					No hay convenios BPS con vencimiento cercano en los próximos 90 días.
				</div>
			{/if}
		</div>
	</section>
</div>
