<script lang="ts">
	import Button from '@/components/ui/button/button.svelte';
	import { formatDateUy } from '$lib/utils';
	import { CalendarClock, Mail, Shield, User, Users } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const dateFromDateTime = (value?: Date | string | null) => {
		if (!value) return '-';
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) return '-';
		return date.toISOString().slice(0, 10);
	};
</script>

<div class="space-y-5">
	<section class="rounded-lg border border-slate-900/15 bg-linear-to-br from-white via-white to-slate-100/70 p-4 shadow-sm md:p-5">
		<div class="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.9fr)] md:items-center">
			<div class="space-y-3">
				<p class="mb-1 text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
					Mi perfil
				</p>
				<div class="space-y-1">
					<h1 class="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
						{data.profile.name || 'Usuario'}
					</h1>
					<p class="text-sm text-slate-500">{data.profile.email || '-'}</p>
				</div>
			</div>

			<div class="hidden gap-2 md:grid md:grid-cols-2 xl:grid-cols-3">
				<div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-slate-900/15">
					<p class="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Rol</p>
					<p class="mt-1 text-sm font-medium text-slate-900">{data.profile.role}</p>
				</div>
				<div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-slate-900/15">
					<p class="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Cuenta creada</p>
					<p class="mt-1 text-sm font-medium text-slate-900">
						{formatDateUy(dateFromDateTime(data.profile.createdAt))}
					</p>
				</div>
				<div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-slate-900/15 sm:col-span-2 xl:col-span-1">
					<p class="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Última carga</p>
					<p class="mt-1 text-sm font-medium text-slate-900">
						{formatDateUy(dateFromDateTime(data.stats.lastCreatedAt))}
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="grid gap-3 md:grid-cols-3">
		<div class="rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm">
			<div class="flex items-start justify-between gap-3">
				<div>
					<p class="text-sm text-slate-500">Pacientes cargados</p>
					<p class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
						{data.stats.patientsCreatedCount}
					</p>
				</div>
				<div class="rounded-md bg-slate-100 p-2 text-slate-700">
					<Users size={18} />
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm">
			<div class="flex items-start justify-between gap-3">
				<div>
					<p class="text-sm text-slate-500">Email</p>
					<p class="mt-2 text-base font-semibold text-slate-900">{data.profile.email || '-'}</p>
				</div>
				<div class="rounded-md bg-slate-100 p-2 text-slate-700">
					<Mail size={18} />
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm">
			<div class="flex items-start justify-between gap-3">
				<div>
					<p class="text-sm text-slate-500">Perfil</p>
					<p class="mt-2 text-base font-semibold text-slate-900">{data.profile.role}</p>
				</div>
				<div class="rounded-md bg-slate-100 p-2 text-slate-700">
					<Shield size={18} />
				</div>
			</div>
		</div>
	</section>

	<section class="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
		<div class="rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm">
			<div class="mb-3.5">
				<h2 class="text-lg font-semibold text-slate-900">Resumen</h2>
				<p class="text-sm text-slate-500">Información básica de la cuenta.</p>
			</div>

			<div class="space-y-3">
				<div class="flex items-start gap-3 rounded-lg border border-slate-900/15 bg-white px-3 py-3">
					<div class="rounded-md bg-slate-100 p-2 text-slate-700">
						<User size={18} />
					</div>
					<div>
						<p class="text-sm text-slate-500">Nombre</p>
						<p class="font-medium text-slate-900">{data.profile.name || '-'}</p>
					</div>
				</div>

				<div class="flex items-start gap-3 rounded-lg border border-slate-900/15 bg-white px-3 py-3">
					<div class="rounded-md bg-slate-100 p-2 text-slate-700">
						<Mail size={18} />
					</div>
					<div>
						<p class="text-sm text-slate-500">Email</p>
						<p class="font-medium text-slate-900">{data.profile.email || '-'}</p>
					</div>
				</div>

				<div class="flex items-start gap-3 rounded-lg border border-slate-900/15 bg-white px-3 py-3">
					<div class="rounded-md bg-slate-100 p-2 text-slate-700">
						<CalendarClock size={18} />
					</div>
					<div>
						<p class="text-sm text-slate-500">Cuenta creada</p>
						<p class="font-medium text-slate-900">
							{formatDateUy(dateFromDateTime(data.profile.createdAt))}
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm">
			<div class="mb-3.5 flex items-center justify-between gap-3">
				<div>
					<h2 class="text-lg font-semibold text-slate-900">Últimos pacientes agregados</h2>
					<p class="text-sm text-slate-500">Últimas 10 altas registradas por esta cuenta.</p>
				</div>
				<Button href="/admin/pacientes" variant="outline" size="sm">Ver pacientes</Button>
			</div>

			{#if data.recentPatients.length === 0}
				<div class="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
					Todavía no agregaste pacientes completados.
				</div>
			{:else}
				<div class="space-y-2.5">
					{#each data.recentPatients as row (row.enrollmentId)}
						<a
							href={`/admin/pacientes/${row.enrollmentId}`}
							class="block rounded-lg border border-slate-900/15 bg-white px-3 py-3 transition hover:border-slate-300 hover:bg-slate-50"
						>
							<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div class="min-w-0">
									<p class="truncate font-medium text-slate-900">
										{row.enrolledFirstName} {row.enrolledLastName}
									</p>
									<p class="text-sm text-slate-500">
										{row.enrolledIdType} {row.enrolledIdNumber}
									</p>
								</div>
								<p class="text-sm text-slate-500">
									{formatDateUy(dateFromDateTime(row.createdAt))}
								</p>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</div>
