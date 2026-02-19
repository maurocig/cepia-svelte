<script lang="ts">
	import {
		admissionModeOptions,
		agreementOrganizationOptions,
		getOptionLabel,
		schoolShiftOptions,
		schoolTypeOptions
	} from '$lib/domain/select-options';
	import { formatDateUy, formatPersonName } from '$lib/utils';
	import Button from '@/components/ui/button/button.svelte';
	import {
		ArrowLeft,
		BookMarked,
		BookOpen,
		FileText,
		Heart,
		School,
		Shield,
		User,
		Users
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const yesNo = (v: boolean) => (v ? 'Sí' : 'No');
	const ageFromDob = (dob?: string | null) => {
		if (!dob) return null;
		const [year, month, day] = dob.split('-').map((v) => Number(v));
		if (!year || !month || !day) return null;

		const today = new Date();
		let age = today.getFullYear() - year;
		const hasHadBirthday =
			today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
		if (!hasHadBirthday) age -= 1;

		return age >= 0 ? age : null;
	};

	const treatmentLabels: [keyof PageData['patient'], string][] = [
		['psychology', 'Psicología'],
		['psychomotricity', 'Psicomotricidad'],
		['speechTherapy', 'Fonoaudiología'],
		['psychopedagogy', 'Psicopedagogía'],
		['pedagogicalSupport', 'Apoyo pedagógico'],
		['physiotherapy', 'Fisioterapia'],
		['occupationalTherapy', 'Terapia ocupacional'],
		['workshops', 'Talleres']
	];

	const activeTreatments = treatmentLabels
		.filter(([key]) => Boolean(data.patient[key]))
		.map(([, label]) => label);
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<Button
			href="/admin/pacientes"
			class="border border-transparent bg-transparent text-slate-600 hover:border-slate-400/20 hover:bg-transparent "
			aria-label="Volver"
		>
			<ArrowLeft strokeWidth="1.5" size={26} />
		</Button>
		<h1 class="text-xl font-semibold">
			{formatPersonName(data.patient.enrolledFirstName)}{' '}
			{formatPersonName(data.patient.enrolledLastName)}
		</h1>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<section class="rounded-md border p-4 lg:p-6">
			<h2
				class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
			>
				<User size={20} />Paciente
			</h2>
			<dl class="grid gap-4 text-sm lg:grid-cols-2">
				<div>
					<dt class="font-medium">Documento</dt>
					<dd>{data.patient.enrolledIdType} {data.patient.enrolledIdNumber}</dd>
				</div>
				<div>
					<dt class="font-medium">Fecha de nacimiento</dt>
					<dd>{formatDateUy(data.patient.enrolledDob)}</dd>
				</div>
				<div>
					<dt class="font-medium">Dirección</dt>
					<dd>{data.patient.enrolledAddress}</dd>
				</div>
				<div>
					<dt class="font-medium">Motivo de consulta</dt>
					<dd>{data.patient.consultationReason}</dd>
				</div>
			</dl>
		</section>

		<section class="rounded-md border p-4 lg:p-6">
			<h2
				class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
			>
				<FileText size={20} />Inscripción
			</h2>
			<dl class="grid gap-4 text-sm lg:grid-cols-2">
				<div>
					<dt class="font-medium">Estado</dt>
					<dd>{data.patient.status === 'active' ? 'Activa' : 'Inactiva'}</dd>
				</div>
				<div>
					<dt class="font-medium">Fecha</dt>
					<dd>{formatDateUy(data.patient.admissionDate)}</dd>
				</div>
				<div>
					<dt class="font-medium">Vencimiento</dt>
					<dd>{formatDateUy(data.patient.agreementExpirationDate)}</dd>
				</div>
				<div>
					<dt class="font-medium">Modo</dt>
					<dd>{getOptionLabel(admissionModeOptions, data.patient.admissionMode)}</dd>
				</div>
				{#if data.patient.admissionMode === 'agreement'}
					<div>
						<dt class="font-medium">Convenio</dt>
						<dd>
							{getOptionLabel(agreementOrganizationOptions, data.patient.agreementOrganization)}
						</dd>
					</div>

					{#if data.patient.agreementOrganization === 'other'}
						<div>
							<dt class="font-medium">Institución (otro)</dt>
							<dd>{data.patient.agreementOtherName ?? '-'}</dd>
						</div>
					{/if}
				{/if}
			</dl>
		</section>

		<section class="rounded-md border p-4">
			<h2
				class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
			>
				<Shield size={20} />Responsable
			</h2>
			<dl class="grid gap-4 text-sm lg:grid-cols-2">
				<div>
					<dt class="font-medium">Nombre</dt>
					<dd>{formatPersonName(data.patient.responsibleAdultName)}</dd>
				</div>
				<div>
					<dt class="font-medium">Teléfono</dt>
					<dd>{data.patient.responsibleAdultPhone}</dd>
				</div>
				<div>
					<dt class="font-medium">Nombre</dt>
					<dd>
						{formatPersonName(data.patient.holderFirstName)}{' '}
						{formatPersonName(data.patient.holderLastName)}
					</dd>
				</div>
				<div>
					<dt class="font-medium">Documento</dt>
					<dd>{data.patient.holderIdType ?? '-'} {data.patient.holderIdNumber}</dd>
				</div>
			</dl>
		</section>

		<section class="rounded-md border p-4 lg:p-6">
			<h2
				class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
			>
				<BookMarked size={20} />Escolaridad
			</h2>
			<dl class="grid gap-4 text-sm lg:grid-cols-2">
				<div>
					<dt class="font-medium">Asiste a colegio</dt>
					<dd>{yesNo(data.patient.attendsSchool)}</dd>
				</div>
				<div>
					<dt class="font-medium">Centro</dt>
					<dd>{data.patient.schoolName ? formatPersonName(data.patient.schoolName) : '-'}</dd>
				</div>
				<div>
					<dt class="font-medium">Tipo</dt>
					<dd>{getOptionLabel(schoolTypeOptions, data.patient.schoolType)}</dd>
				</div>
				<div>
					<dt class="font-medium">Grado / Turno</dt>
					<dd>
						{data.patient.schoolGrade ?? '-'} / {getOptionLabel(
							schoolShiftOptions,
							data.patient.schoolShift
						)}
					</dd>
				</div>
			</dl>
		</section>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<section class="rounded-md border p-4 lg:p-6">
			<h2
				class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
			>
				<Users size={20} />Grupo familiar
			</h2>
			<dl class="grid gap-4 text-sm lg:grid-cols-2">
				<div>
					<dt class="font-medium">Edad de la madre</dt>
					<dd>{ageFromDob(data.patient.motherDob) ?? '-'}</dd>
				</div>
				<div>
					<dt class="font-medium">Ocupación de la madre</dt>
					<dd>{data.patient.motherOccupation ?? '-'}</dd>
				</div>
				<div>
					<dt class="font-medium">Edad del padre</dt>
					<dd>{ageFromDob(data.patient.fatherDob) ?? '-'}</dd>
				</div>
				<div>
					<dt class="font-medium">Ocupación del padre</dt>
					<dd>{data.patient.fatherOccupation ?? '-'}</dd>
				</div>
				<div>
					<dt class="font-medium">Cantidad de hermanos</dt>
					<dd>{data.patient.siblingsCount ?? '-'}</dd>
				</div>
			</dl>
			{#if data.patient.familyNotes}
				<p class="text-muted-foreground mt-3 text-sm">{data.patient.familyNotes}</p>
			{/if}
		</section>

		<section class="rounded-md border p-4 lg:p-6">
			<h2
				class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
			>
				<Heart size={20} />Tratamientos
			</h2>
			<p class="text-sm">
				{activeTreatments.length ? activeTreatments.join(', ') : 'Sin tratamientos marcados'}
			</p>
			{#if data.patient.treatmentsNotes}
				<p class="text-muted-foreground mt-2 text-sm">{data.patient.treatmentsNotes}</p>
			{/if}
		</section>
	</div>
</div>
