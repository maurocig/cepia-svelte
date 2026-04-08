<script lang="ts">
	import { enhance as kitEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Checkbox from '$lib/components/ui/checkbox/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { PhoneInput } from '$lib/components/ui/phone-input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import {
		admissionModeOptions,
		agreementOrganizationOptions,
		enrollmentStatusOptions,
		getOptionLabel,
		idTypeOptions,
		schoolShiftOptions,
		schoolTypeOptions,
		treatmentDayOptions,
		treatmentHourOptions,
		treatmentMinuteOptions
	} from '$lib/domain/select-options';
	import {
		enrollmentEditSchema,
		familyEditSchema,
		patientEditSchema,
		responsibleEditSchema,
		schoolEditSchema,
		treatmentsEditSchema
	} from '$lib/schemas/edit-sections';
	import {
		emptyTreatmentAssignment,
		getTreatmentLabel,
		parseTreatmentAssignments,
		treatmentOptions,
		type TreatmentAssignment
	} from '$lib/treatments';
	import {
		ageFromDob,
		type DocumentIdType,
		formatDateUy,
		formatDocumentNumber,
		formatPersonName,
		sanitizeDocumentNumber
	} from '$lib/utils';
	import DatePicker from '@/components/DatePicker.svelte';
	import Button from '@/components/ui/button/button.svelte';
	import {
		ArrowLeft,
		BookMarked,
		FileText,
		Heart,
		Pencil,
		Shield,
		Trash2,
		User,
		Users
	} from 'lucide-svelte';
	import { toast } from 'svelte-french-toast';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	type OptionalFormDocumentIdType = Exclude<DocumentIdType, null | undefined>;
	type RequiredFormDocumentIdType = Exclude<DocumentIdType, null | undefined | ''>;
	const yesNo = (v: boolean) => (v ? 'Sí' : 'No');
	const expirationBadgeClass = (status: string | null) => {
		if (status === 'active') return 'bg-emerald-100 text-emerald-700';
		if (status === 'expired') return 'bg-rose-100 text-rose-700';
		return 'bg-amber-100 text-amber-700';
	};
	const expirationLabel = (status: string | null, daysUntil: number | null) => {
		if (status === 'expired') return 'Vencido';
		return `En ${Math.max(daysUntil ?? 0, 0)} dias`;
	};
	const formatTreatmentAssignment = (assignment: TreatmentAssignment) => {
		const details = [
			assignment.professionalName.trim(),
			getOptionLabel(treatmentDayOptions, assignment.day, '').trim(),
			assignment.time.trim()
		].filter(Boolean);

		return details.length
			? `${getTreatmentLabel(assignment.treatmentType)}${details.length ? `, ${details.join(', ')}` : ''}`
			: getTreatmentLabel(assignment.treatmentType);
	};

	let openPatientDialog = $state(false);
	let openEnrollmentDialog = $state(false);
	let openResponsibleDialog = $state(false);
	let openSchoolDialog = $state(false);
	let openFamilyDialog = $state(false);
	let openTreatmentsDialog = $state(false);
	let deletingPatient = $state(false);

	const sectionHasInfo = (...values: Array<string | number | null | undefined>) =>
		values.some((value) => value != null && String(value).trim() !== '');
	const motherStartsOpen = sectionHasInfo(
		data.patient.motherName,
		data.patient.motherDob,
		data.patient.motherOccupation,
		data.patient.motherPhone
	);
	const fatherStartsOpen = sectionHasInfo(
		data.patient.fatherName,
		data.patient.fatherDob,
		data.patient.fatherOccupation,
		data.patient.fatherPhone
	);
	let openFamilyPanels = $state<string[]>([
		...(motherStartsOpen ? ['mother'] : []),
		...(fatherStartsOpen ? ['father'] : [])
	]);

	const patientEditForm = superForm(data.patientEditForm, {
		validators: zod4Client(patientEditSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				openPatientDialog = false;
				toast.success('El paciente fue actualizado correctamente.');
				return;
			}
			if (result.type === 'failure') {
				toast.error(result.data?.message ?? 'No se pudieron guardar los cambios.');
			}
		}
	});
	const {
		form: patientEditData,
		enhance: enhancePatientEdit,
		submitting: submittingPatientEdit
	} = patientEditForm;

	const enrollmentEditForm = superForm(data.enrollmentEditForm, {
		validators: zod4Client(enrollmentEditSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				openEnrollmentDialog = false;
				toast.success('Inscripción actualizada correctamente.');
				return;
			}
			if (result.type === 'failure') {
				toast.error(result.data?.message ?? 'No se pudieron guardar los cambios.');
			}
		}
	});
	const {
		form: enrollmentEditData,
		enhance: enhanceEnrollmentEdit,
		submitting: submittingEnrollmentEdit
	} = enrollmentEditForm;

	const responsibleEditForm = superForm(data.responsibleEditForm, {
		validators: zod4Client(responsibleEditSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				openResponsibleDialog = false;
				toast.success('Responsable actualizado correctamente.');
				return;
			}
			if (result.type === 'failure') {
				toast.error(result.data?.message ?? 'No se pudieron guardar los cambios.');
			}
		}
	});
	const {
		form: responsibleEditData,
		enhance: enhanceResponsibleEdit,
		submitting: submittingResponsibleEdit
	} = responsibleEditForm;

	const schoolEditForm = superForm(data.schoolEditForm, {
		validators: zod4Client(schoolEditSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				openSchoolDialog = false;
				toast.success('La escolaridad fue actualizada.');
				return;
			}
			if (result.type === 'failure') {
				toast.error(result.data?.message ?? 'No se pudieron guardar los cambios.');
			}
		}
	});
	const {
		form: schoolEditData,
		enhance: enhanceSchoolEdit,
		submitting: submittingSchoolEdit
	} = schoolEditForm;

	const familyEditForm = superForm(data.familyEditForm, {
		validators: zod4Client(familyEditSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				openFamilyDialog = false;
				toast.success('El grupo familiar se actualizó correctamente.');
				return;
			}
			if (result.type === 'failure') {
				toast.error(result.data?.message ?? 'No se pudieron guardar los cambios.');
			}
		}
	});
	const {
		form: familyEditData,
		enhance: enhanceFamilyEdit,
		submitting: submittingFamilyEdit
	} = familyEditForm;

	const treatmentsEditForm = superForm(data.treatmentsEditForm, {
		validators: zod4Client(treatmentsEditSchema),
		dataType: 'json',
		resetForm: false,
		onResult: async ({ result }) => {
			if (result.type === 'success') {
				openTreatmentsDialog = false;
				toast.success('Los tratamientos se actualizaron correctamente.');
				await invalidateAll();
				return;
			}
			if (result.type === 'failure') {
				toast.error(result.data?.message ?? 'No se pudieron guardar los cambios.');
			}
		}
	});
	const {
		form: treatmentsEditData,
		enhance: enhanceTreatmentsEdit,
		submitting: submittingTreatmentsEdit
	} = treatmentsEditForm;

	const assignmentsEqual = (a: TreatmentAssignment[], b: TreatmentAssignment[]) => {
		if (a.length !== b.length) return false;
		return a.every(
			(item, index) =>
				item.treatmentType === b[index]?.treatmentType &&
				item.day === b[index]?.day &&
				item.time === b[index]?.time &&
				item.professionalName === b[index]?.professionalName
		);
	};

	const persistedTreatmentAssignments = $derived(
		parseTreatmentAssignments(data.patient.treatmentAssignments)
	);
	const persistedPatientNotes = $derived(data.patient.treatmentsNotes ?? '');

	let modalTreatmentAssignments = $state<TreatmentAssignment[]>(
		persistedTreatmentAssignments.map((assignment) => ({ ...assignment }))
	);
	let modalTreatmentNotes = $state(data.patient.treatmentsNotes ?? '');
	const modalTreatmentAssignmentsSerialized = $derived(JSON.stringify(modalTreatmentAssignments));

	const writeModalToForm = () => {
		$treatmentsEditData.treatmentsNotes = modalTreatmentNotes;
		$treatmentsEditData.treatmentAssignments = modalTreatmentAssignments.map((assignment) => ({
			...assignment
		}));
	};

	const resetModalFromPatient = () => {
		modalTreatmentAssignments = persistedTreatmentAssignments.map((assignment) => ({
			...assignment
		}));
		modalTreatmentNotes = data.patient.treatmentsNotes ?? '';
	};

	const openTreatmentsModal = () => {
		resetModalFromPatient();
		writeModalToForm();
		openTreatmentsDialog = true;
	};

	const cancelTreatmentsModal = () => {
		openTreatmentsDialog = false;
	};

	const addModalTreatmentAssignment = () => {
		modalTreatmentAssignments = [...modalTreatmentAssignments, emptyTreatmentAssignment()];
		writeModalToForm();
	};

	const updateModalTreatmentAssignment = (
		index: number,
		key: keyof TreatmentAssignment,
		value: string
	) => {
		const next = modalTreatmentAssignments.map((assignment, currentIndex) =>
			currentIndex === index ? { ...assignment, [key]: value } : { ...assignment }
		);
		modalTreatmentAssignments = next;
		writeModalToForm();
	};

	const getTimeParts = (value: string) => {
		if (!value || !/^\d{2}:\d{2}$/.test(value)) {
			return { hour: '', minute: '' };
		}

		return {
			hour: value.slice(0, 2),
			minute: value.slice(3, 5)
		};
	};

	const updateModalTreatmentAssignmentTimePart = (
		index: number,
		part: 'hour' | 'minute',
		value: string
	) => {
		const current = getTimeParts(modalTreatmentAssignments[index]?.time ?? '');
		const nextHour = part === 'hour' ? value : current.hour || '00';
		const nextMinute = part === 'minute' ? value : current.minute || '00';
		const nextTime = nextHour && nextMinute ? `${nextHour}:${nextMinute}` : '';

		updateModalTreatmentAssignment(index, 'time', nextTime);
	};

	const removeModalTreatmentAssignment = (index: number) => {
		modalTreatmentAssignments = modalTreatmentAssignments.filter(
			(_, currentIndex) => currentIndex !== index
		);
		writeModalToForm();
	};

	const updatePatientIdType = (value: RequiredFormDocumentIdType) => {
		$patientEditData.enrolledIdType = value;
		$patientEditData.enrolledIdNumber = sanitizeDocumentNumber($patientEditData.enrolledIdNumber, value);
	};

	const updatePatientIdNumber = (value: string) => {
		$patientEditData.enrolledIdNumber = sanitizeDocumentNumber(value, $patientEditData.enrolledIdType);
	};

	const updateHolderIdType = (value: OptionalFormDocumentIdType) => {
		$enrollmentEditData.holderIdType = value;
		$enrollmentEditData.holderIdNumber = sanitizeDocumentNumber($enrollmentEditData.holderIdNumber, value);
	};

	const updateHolderIdNumber = (value: string) => {
		$enrollmentEditData.holderIdNumber = sanitizeDocumentNumber(value, $enrollmentEditData.holderIdType);
	};

	const activeTreatments = $derived(
		Array.from(
			new Set(
				persistedTreatmentAssignments
					.map((assignment) => assignment.treatmentType)
					.filter(Boolean)
					.map((code) => getTreatmentLabel(code))
			)
		)
	);

	const enhanceDelete = () => {
		deletingPatient = true;

		return async ({
			result,
			update
		}: {
			result: { type: string };
			update: () => Promise<void>;
		}) => {
			if (result.type === 'failure' || result.type === 'error') {
				deletingPatient = false;
			}
			await update();
		};
	};
</script>

<div class="space-y-5">
	<section class="rounded-lg border border-slate-900/15 bg-linear-to-br from-white via-white to-slate-100/70 p-4 shadow-sm md:p-5">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Button
						href="/admin/pacientes"
						class="border border-transparent bg-transparent text-slate-600 hover:border-slate-400/20 hover:bg-transparent"
						aria-label="Volver"
					>
						<ArrowLeft strokeWidth="1.5" size={26} />
					</Button>
					<p class="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
						Ficha de paciente
					</p>
				</div>
				<div class="space-y-1.5">
					<h1 class="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
						{formatPersonName(data.patient.enrolledFirstName)}
						{formatPersonName(data.patient.enrolledLastName)}
					</h1>
					<p class="text-sm text-slate-500">
						{data.patient.enrolledIdType}
						{#if data.patient.enrolledIdNumber}
							{formatDocumentNumber(
								data.patient.enrolledIdNumber,
								data.patient.enrolledIdType as DocumentIdType
							)}
						{:else}
							Sin documento cargado
						{/if}
					</p>
				</div>
			</div>

			<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
				<div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-slate-900/15">
					<p class="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Estado</p>
					<p class="mt-1 text-sm font-medium text-slate-900">
						{data.patient.status === 'active' ? 'Activo' : 'Inactivo'}
					</p>
				</div>
				<div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-slate-900/15">
					<p class="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Edad</p>
					<p class="mt-1 text-sm font-medium text-slate-900">{ageFromDob(data.patient.enrolledDob) ?? '-'}</p>
				</div>
				<div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-slate-900/15">
					<p class="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Ingreso</p>
					<p class="mt-1 text-sm font-medium text-slate-900">
						{formatDateUy(data.patient.admissionDate)}
					</p>
				</div>
				<div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-slate-900/15">
					<p class="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Modalidad</p>
					<p class="mt-1 text-sm font-medium text-slate-900">
						{getOptionLabel(admissionModeOptions, data.patient.admissionMode)}
					</p>
				</div>
			</div>
		</div>
	</section>

	<div class="columns-1 gap-4 md:columns-2">
		<div class="mb-4 break-inside-avoid">
		<Dialog.Root bind:open={openPatientDialog}>
			<section class="group rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm lg:p-5">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<User size={20} />
					<span class="mr-auto">Paciente</span>
					{#if data.canManage}
						<Dialog.Trigger
							class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
								'h-8 w-8 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
						>
							<Pencil size={16} />
						</Dialog.Trigger>
					{/if}
				</h2>
				<dl class="grid gap-4 text-sm lg:grid-cols-2">
					<div>
						<dt class="font-medium">Nombre</dt>
						<dd>
							{formatPersonName(data.patient.enrolledFirstName)}
							{formatPersonName(data.patient.enrolledLastName)}
						</dd>
					</div>
					<div>
						<dt class="font-medium">Documento</dt>
						<dd>
							{data.patient.enrolledIdType}
							{#if data.patient.enrolledIdNumber}
								{formatDocumentNumber(
									data.patient.enrolledIdNumber,
									data.patient.enrolledIdType as DocumentIdType
								)}
							{:else}
								-
							{/if}
						</dd>
					</div>
					<div>
						<dt class="font-medium">Edad</dt>
						<dd>{ageFromDob(data.patient.enrolledDob) ?? '-'}</dd>
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
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
				<form method="POST" action="?/patient" use:enhancePatientEdit>
					<Dialog.Header>
						<Dialog.Title>Editar paciente</Dialog.Title>
						<Dialog.Description>Actualizá los datos del paciente.</Dialog.Description>
					</Dialog.Header>
					<div class="grid gap-4 py-4 md:grid-cols-2">
						<Form.Field form={patientEditForm} name="enrolledFirstName">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="enrolledFirstName">Nombre</Label>
									<Input
										id="enrolledFirstName"
										{...props}
										bind:value={$patientEditData.enrolledFirstName}
									/>
									<input
										type="hidden"
										name="enrolledFirstName"
										value={$patientEditData.enrolledFirstName}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={patientEditForm} name="enrolledLastName">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="enrolledLastName">Apellido</Label>
									<Input
										id="enrolledLastName"
										{...props}
										bind:value={$patientEditData.enrolledLastName}
									/>
									<input
										type="hidden"
										name="enrolledLastName"
										value={$patientEditData.enrolledLastName}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<div class="md:col-span-2 grid gap-3 md:grid-cols-[9rem_minmax(0,1fr)] md:items-start">
							<Form.Field form={patientEditForm} name="enrolledIdType">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label>Tipo doc.</Label>
										<Select.Root
											type="single"
											value={$patientEditData.enrolledIdType}
											onValueChange={(value) => updatePatientIdType(value as RequiredFormDocumentIdType)}
										>
											<Select.Trigger {...props} class="h-10 w-full justify-between">
												{getOptionLabel(
													idTypeOptions,
													$patientEditData.enrolledIdType,
													'Seleccionar'
												)}
											</Select.Trigger>
											<Select.Content>
												{#each idTypeOptions as option (option.value)}
													<Select.Item value={option.value} label={option.label}
														>{option.label}</Select.Item
													>
												{/each}
											</Select.Content>
										</Select.Root>
										<input
											type="hidden"
											name="enrolledIdType"
											value={$patientEditData.enrolledIdType}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={patientEditForm} name="enrolledIdNumber">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="enrolledIdNumber">Número doc.</Label>
										<Input
											id="enrolledIdNumber"
											{...props}
											value={formatDocumentNumber(
												$patientEditData.enrolledIdNumber,
												$patientEditData.enrolledIdType
											)}
											type="text"
											inputmode={$patientEditData.enrolledIdType === 'PAS' ? 'text' : 'numeric'}
											pattern={$patientEditData.enrolledIdType === 'PAS' ? '[A-Za-z0-9]*' : '[0-9.-]*'}
											oninput={(event: Event) =>
												updatePatientIdNumber((event.currentTarget as HTMLInputElement).value)}
										/>
										<input
											type="hidden"
											name="enrolledIdNumber"
											value={$patientEditData.enrolledIdNumber}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<Form.Field form={patientEditForm} name="enrolledDob">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label>Fecha nacimiento</Label>
									<DatePicker max="today" bind:value={$patientEditData.enrolledDob} />
									<input type="hidden" name="enrolledDob" value={$patientEditData.enrolledDob} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={patientEditForm} name="enrolledAddress" class="md:col-span-2">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="enrolledAddress">Dirección</Label>
									<Input
										id="enrolledAddress"
										{...props}
										bind:value={$patientEditData.enrolledAddress}
									/>
									<input
										type="hidden"
										name="enrolledAddress"
										value={$patientEditData.enrolledAddress}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={patientEditForm} name="consultationReason" class="md:col-span-2">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="consultationReason">Motivo de consulta</Label>
									<Textarea
										id="consultationReason"
										{...props}
										bind:value={$patientEditData.consultationReason}
									/>
									<input
										type="hidden"
										name="consultationReason"
										value={$patientEditData.consultationReason}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<Dialog.Footer>
						<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}
							>Cancelar</Dialog.Close
						>
						<Button type="submit" disabled={$submittingPatientEdit}>
							{#if $submittingPatientEdit}
								<span
									class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								></span>
								Guardando...
							{:else}
								Guardar cambios
							{/if}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>

		<div class="mb-4 break-inside-avoid">
		<Dialog.Root bind:open={openEnrollmentDialog}>
			<section class="group rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm lg:p-5">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<FileText size={20} />
					<span class="mr-auto">Inscripción</span>
					{#if data.canManage}
						<Dialog.Trigger
							class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
								'h-8 w-8 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
							><Pencil size={16} /></Dialog.Trigger
						>
					{/if}
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
						{#if data.patient.agreementOrganization === 'BPS'}
							<div>
								<dt class="font-medium">Vencimiento</dt>
								<dd>
									<div class="flex flex-wrap items-center gap-2">
										<span>{formatDateUy(data.patient.agreementExpirationDate)}</span>
										<span
											class={'rounded-full px-2 py-1 text-xs font-medium ' +
												expirationBadgeClass(data.agreementExpirationStatus)}
										>
											{expirationLabel(
												data.agreementExpirationStatus,
												data.agreementExpirationDaysUntil
											)}
										</span>
									</div>
								</dd>
							</div>
						{/if}
						{#if data.patient.agreementOrganization === 'other'}
							<div>
								<dt class="font-medium">Institución (otro)</dt>
								<dd>{data.patient.agreementOtherName ?? '-'}</dd>
							</div>
						{/if}
					{/if}
				</dl>

				<!-- Información del titular -->
				<dl class="mt-4 grid gap-4 text-sm lg:grid-cols-2">
					<div>
						<dt class="font-medium">Nombre de titular</dt>
						<dd>
							{formatPersonName(data.patient.holderFirstName)}
							{formatPersonName(data.patient.holderLastName)}
						</dd>
					</div>
					<div>
						<dt class="font-medium">Documento de titular</dt>
						<dd>
							{data.patient.holderIdType ?? '-'}
							{#if data.patient.holderIdNumber}
								{formatDocumentNumber(
									data.patient.holderIdNumber,
									data.patient.holderIdType as DocumentIdType
								)}
							{:else}
								-
							{/if}
						</dd>
					</div>
					<div>
						<dt class="font-medium">Teléfono de titular</dt>
						<dd>{data.patient.holderPhone}</dd>
					</div>
					<div>
						<dt class="font-medium">Email de titular</dt>
						<dd>{data.patient.holderEmail}</dd>
					</div>
				</dl>
			</section>
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
				<form method="POST" action="?/enrollment" use:enhanceEnrollmentEdit>
					<Dialog.Header>
						<Dialog.Title>Editar inscripción</Dialog.Title>
						<Dialog.Description>Actualizá estado y condiciones de inscripción.</Dialog.Description>
					</Dialog.Header>
					<div class="grid gap-4 py-4 md:grid-cols-2">
						<Form.Field form={enrollmentEditForm} name="enrollmentStatus">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label>Estado</Label>
									<Select.Root type="single" bind:value={$enrollmentEditData.enrollmentStatus}>
										<Select.Trigger {...props} class="h-10 w-full justify-between">
											{getOptionLabel(
												enrollmentStatusOptions,
												$enrollmentEditData.enrollmentStatus,
												'Seleccionar'
											)}
										</Select.Trigger>
										<Select.Content>
											{#each enrollmentStatusOptions as option (option.value)}
												<Select.Item value={option.value} label={option.label}
													>{option.label}</Select.Item
												>
											{/each}
										</Select.Content>
									</Select.Root>
									<input
										type="hidden"
										name="enrollmentStatus"
										value={$enrollmentEditData.enrollmentStatus}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={enrollmentEditForm} name="admissionDate">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label>Fecha</Label>
									<DatePicker max="today" bind:value={$enrollmentEditData.admissionDate} />
									<input
										type="hidden"
										name="admissionDate"
										value={$enrollmentEditData.admissionDate}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={enrollmentEditForm} name="admissionMode">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label>Modo</Label>
									<Select.Root
										type="single"
										bind:value={$enrollmentEditData.admissionMode}
										onValueChange={(v) => {
											if (v !== 'agreement') {
												$enrollmentEditData.agreementOrganization = '';
												$enrollmentEditData.agreementExpirationDate = '';
											}
										}}
									>
										<Select.Trigger {...props} class="h-10 w-full justify-between">
											{getOptionLabel(
												admissionModeOptions,
												$enrollmentEditData.admissionMode,
												'Seleccionar'
											)}
										</Select.Trigger>
										<Select.Content>
											{#each admissionModeOptions as option (option.value)}
												<Select.Item value={option.value} label={option.label}
													>{option.label}</Select.Item
												>
											{/each}
										</Select.Content>
									</Select.Root>
									<input
										type="hidden"
										name="admissionMode"
										value={$enrollmentEditData.admissionMode}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						{#if $enrollmentEditData.admissionMode === 'agreement'}
							<Form.Field form={enrollmentEditForm} name="agreementOrganization">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label>Convenio</Label>
										<Select.Root
											type="single"
											bind:value={$enrollmentEditData.agreementOrganization}
											onValueChange={(v) => {
												if (v !== 'BPS') {
													$enrollmentEditData.agreementExpirationDate = '';
												}
											}}
										>
											<Select.Trigger {...props} class="h-10 w-full justify-between">
												{getOptionLabel(
													agreementOrganizationOptions,
													$enrollmentEditData.agreementOrganization,
													'Seleccionar'
												)}
											</Select.Trigger>
											<Select.Content>
												{#each agreementOrganizationOptions as option (option.value)}
													<Select.Item value={option.value} label={option.label}
														>{option.label}</Select.Item
													>
												{/each}
											</Select.Content>
										</Select.Root>
										<input
											type="hidden"
											name="agreementOrganization"
											value={$enrollmentEditData.agreementOrganization}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							{#if $enrollmentEditData.agreementOrganization === 'other'}
								<Form.Field form={enrollmentEditForm} name="agreementOtherName">
									<Form.Control>
										{#snippet children({ props }: { props: Record<string, any> })}
											<Label for="agreementOtherName">Institución (otro)</Label>
											<Input
												id="agreementOtherName"
												{...props}
												bind:value={$enrollmentEditData.agreementOtherName}
											/>
											<input
												type="hidden"
												name="agreementOtherName"
												value={$enrollmentEditData.agreementOtherName}
											/>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							{/if}
							{#if $enrollmentEditData.agreementOrganization === 'BPS'}
								<Form.Field form={enrollmentEditForm} name="agreementExpirationDate">
									<Form.Control>
										{#snippet children({ props }: { props: Record<string, any> })}
											<Label>Vencimiento</Label>
											<DatePicker
												min="today"
												bind:value={$enrollmentEditData.agreementExpirationDate}
											/>
											<input
												type="hidden"
												name="agreementExpirationDate"
												value={$enrollmentEditData.agreementExpirationDate}
											/>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							{/if}
						{/if}
						<Form.Field form={enrollmentEditForm} name="holderFirstName">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="holderFirstName">Nombre de titular</Label>
									<Input
										id="holderFirstName"
										{...props}
										bind:value={$enrollmentEditData.holderFirstName}
									/>
									<input
										type="hidden"
										name="holderFirstName"
										value={$enrollmentEditData.holderFirstName}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={enrollmentEditForm} name="holderLastName">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="holderLastName">Apellido de titular</Label>
									<Input
										id="holderLastName"
										{...props}
										bind:value={$enrollmentEditData.holderLastName}
									/>
									<input
										type="hidden"
										name="holderLastName"
										value={$enrollmentEditData.holderLastName}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<div class="md:col-span-2 grid gap-3 md:grid-cols-[11rem_minmax(0,1fr)] md:items-start">
							<Form.Field form={enrollmentEditForm} name="holderIdType">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label>Tipo de documento de titular</Label>
										<Select.Root
											type="single"
											value={$enrollmentEditData.holderIdType}
											onValueChange={(value) => updateHolderIdType(value as OptionalFormDocumentIdType)}
										>
											<Select.Trigger {...props} class="h-10 w-full justify-between">
												{getOptionLabel(
													idTypeOptions,
													$enrollmentEditData.holderIdType,
													'Seleccionar'
												)}
											</Select.Trigger>
											<Select.Content>
												{#each idTypeOptions as option (option.value)}
													<Select.Item value={option.value} label={option.label}
														>{option.label}</Select.Item
													>
												{/each}
											</Select.Content>
										</Select.Root>
										<input
											type="hidden"
											name="holderIdType"
											value={$enrollmentEditData.holderIdType}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={enrollmentEditForm} name="holderIdNumber">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="holderIdNumber">Número doc. titular</Label>
										<Input
											id="holderIdNumber"
											{...props}
											value={formatDocumentNumber(
												$enrollmentEditData.holderIdNumber,
												$enrollmentEditData.holderIdType
											)}
											type="text"
											inputmode={$enrollmentEditData.holderIdType === 'PAS' ? 'text' : 'numeric'}
											pattern={$enrollmentEditData.holderIdType === 'PAS' ? '[A-Za-z0-9]*' : '[0-9.-]*'}
											oninput={(event: Event) =>
												updateHolderIdNumber((event.currentTarget as HTMLInputElement).value)}
										/>
										<input
											type="hidden"
											name="holderIdNumber"
											value={$enrollmentEditData.holderIdNumber}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<Form.Field form={enrollmentEditForm} name="holderPhone">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="holderPhone">Tel. titular</Label>
									<Input id="holderPhone" {...props} bind:value={$enrollmentEditData.holderPhone} />
									<input type="hidden" name="holderPhone" value={$enrollmentEditData.holderPhone} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={enrollmentEditForm} name="holderEmail">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="holderEmail">Email titular</Label>
									<Input
										id="holderEmail"
										type="email"
										{...props}
										bind:value={$enrollmentEditData.holderEmail}
									/>
									<input type="hidden" name="holderEmail" value={$enrollmentEditData.holderEmail} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<Dialog.Footer>
						<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}
							>Cancelar</Dialog.Close
						>
						<Button type="submit" disabled={$submittingEnrollmentEdit}>
							{#if $submittingEnrollmentEdit}
								<span
									class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								></span>
								Guardando...
							{:else}
								Guardar cambios
							{/if}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>

		<div class="mb-4 break-inside-avoid">
		<Dialog.Root bind:open={openResponsibleDialog}>
			<section class="group rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm lg:p-5">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<Shield size={20} />
					<span class="mr-auto">Adulto responsable</span>
					{#if data.canManage}
						<Dialog.Trigger
							class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
								' h-8 w-8 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
							><Pencil size={16} /></Dialog.Trigger
						>
					{/if}
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
				</dl>
			</section>
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
				<form method="POST" action="?/responsible" use:enhanceResponsibleEdit>
					<Dialog.Header
						><Dialog.Title>Editar responsable</Dialog.Title><Dialog.Description
							>Actualizá datos del adulto responsable.</Dialog.Description
						></Dialog.Header
					>
					<div class="grid gap-4 py-4 md:grid-cols-2">
						<Form.Field form={responsibleEditForm} name="responsibleAdultName">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="responsibleAdultName">Adulto responsable</Label>
									<Input
										id="responsibleAdultName"
										{...props}
										bind:value={$responsibleEditData.responsibleAdultName}
									/>
									<input
										type="hidden"
										name="responsibleAdultName"
										value={$responsibleEditData.responsibleAdultName}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={responsibleEditForm} name="responsibleAdultPhone">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="responsibleAdultPhone">Teléfono</Label>
									<Input
										id="responsibleAdultPhone"
										{...props}
										bind:value={$responsibleEditData.responsibleAdultPhone}
									/>
									<input
										type="hidden"
										name="responsibleAdultPhone"
										value={$responsibleEditData.responsibleAdultPhone}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<Dialog.Footer>
						<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}
							>Cancelar</Dialog.Close
						>
						<Button type="submit" disabled={$submittingResponsibleEdit}>
							{#if $submittingResponsibleEdit}
								<span
									class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								></span>
								Guardando...
							{:else}
								Guardar cambios
							{/if}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>

		<div class="mb-4 break-inside-avoid">
		<Dialog.Root bind:open={openSchoolDialog}>
			<section class="group rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm lg:p-5">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<BookMarked size={20} />
					<span class="mr-auto">Escolaridad</span>
					{#if data.canManage}
						<Dialog.Trigger
							class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
								' h-8 w-8 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
							><Pencil size={16} /></Dialog.Trigger
						>
					{/if}
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
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
				<form method="POST" action="?/school" use:enhanceSchoolEdit>
					<Dialog.Header
						><Dialog.Title>Editar escolaridad</Dialog.Title><Dialog.Description
							>Actualizá la información educativa.</Dialog.Description
						></Dialog.Header
					>
					<div class="space-y-4 py-4">
						<label for="attendsSchool" class="flex items-center gap-2 text-sm font-medium">
							<Checkbox.Root
								id="attendsSchool"
								name="attendsSchool"
								bind:checked={$schoolEditData.attendsSchool}
							/>
							<input
								type="hidden"
								name="attendsSchool"
								value={$schoolEditData.attendsSchool ? 'true' : 'false'}
							/>
							Asiste a colegio
						</label>
						<div
							class:opacity-60={!$schoolEditData.attendsSchool}
							class="grid gap-4 md:grid-cols-2"
						>
							<Form.Field form={schoolEditForm} name="schoolName">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="schoolName">Centro</Label>
										<Input
											id="schoolName"
											{...props}
											bind:value={$schoolEditData.schoolName}
											disabled={!$schoolEditData.attendsSchool}
										/>
										<input type="hidden" name="schoolName" value={$schoolEditData.schoolName} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={schoolEditForm} name="schoolType">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label>Tipo</Label>
										<Select.Root
											type="single"
											bind:value={$schoolEditData.schoolType}
											disabled={!$schoolEditData.attendsSchool}
											onValueChange={(v) => {
												if (v === 'kindergarten') {
													$schoolEditData.schoolGrade = undefined;
												}
											}}
										>
											<Select.Trigger {...props} class="h-10 w-full justify-between">
												{getOptionLabel(
													schoolTypeOptions,
													$schoolEditData.schoolType,
													'Seleccionar'
												)}
											</Select.Trigger>
											<Select.Content>
												{#each schoolTypeOptions as option (option.value)}
													<Select.Item value={option.value} label={option.label}
														>{option.label}</Select.Item
													>
												{/each}
											</Select.Content>
										</Select.Root>
										<input type="hidden" name="schoolType" value={$schoolEditData.schoolType} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							{#if $schoolEditData.schoolType !== 'kindergarten'}
								<Form.Field form={schoolEditForm} name="schoolGrade">
									<Form.Control>
										{#snippet children({ props }: { props: Record<string, any> })}
											<Label for="schoolGrade">Grado</Label>
											<Input
												id="schoolGrade"
												{...props}
												bind:value={$schoolEditData.schoolGrade}
												disabled={!$schoolEditData.attendsSchool}
											/>
											<input type="hidden" name="schoolGrade" value={$schoolEditData.schoolGrade} />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							{/if}
							<Form.Field form={schoolEditForm} name="schoolShift">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label>Turno</Label>
										<Select.Root
											type="single"
											bind:value={$schoolEditData.schoolShift}
											disabled={!$schoolEditData.attendsSchool}
										>
											<Select.Trigger {...props} class="h-10 w-full justify-between">
												{getOptionLabel(
													schoolShiftOptions,
													$schoolEditData.schoolShift,
													'Seleccionar'
												)}
											</Select.Trigger>
											<Select.Content>
												{#each schoolShiftOptions as option (option.value)}
													<Select.Item value={option.value} label={option.label}
														>{option.label}</Select.Item
													>
												{/each}
											</Select.Content>
										</Select.Root>
										<input type="hidden" name="schoolShift" value={$schoolEditData.schoolShift} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
					</div>
					<Dialog.Footer>
						<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}
							>Cancelar</Dialog.Close
						>
						<Button type="submit" disabled={$submittingSchoolEdit}>
							{#if $submittingSchoolEdit}
								<span
									class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								></span>
								Guardando...
							{:else}
								Guardar cambios
							{/if}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>
		<div class="mb-4 break-inside-avoid">
		<Dialog.Root bind:open={openFamilyDialog}>
			<section class="group rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm lg:p-5">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<Users size={20} />
					<span class="mr-auto">Grupo familiar</span>
					{#if data.canManage}
						<Dialog.Trigger
							class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
								' h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
							><Pencil size={16} /></Dialog.Trigger
						>
					{/if}
				</h2>
				<dl class="grid gap-4 text-sm">
					<div>
						<dd>
							<Accordion.Root type="multiple" class="space-y-4" bind:value={openFamilyPanels}>
								<Accordion.Item value="mother" class="!border-b-0">
									<Accordion.Trigger
										class="w-full cursor-pointer px-0 py-0 text-sm font-medium hover:no-underline"
									>
										Información de la madre
									</Accordion.Trigger>
									<Accordion.Content class="mt-2 ml-4 pl-4">
										<div class="grid gap-1.5">
											<div>
												<span class="font-medium">Nombre:</span>
												{data.patient.motherName || '-'}
											</div>
											<div>
												<span class="font-medium">Edad:</span>
												{ageFromDob(data.patient.motherDob) ?? '-'}
											</div>
											<div>
												<span class="font-medium">Fecha de nacimiento:</span>
												{formatDateUy(data.patient.motherDob)}
											</div>
											<div>
												<span class="font-medium">Ocupación:</span>
												{data.patient.motherOccupation ?? '-'}
											</div>
											<div>
												<span class="font-medium">Teléfono:</span>
												{data.patient.motherPhone ?? '-'}
											</div>
										</div>
									</Accordion.Content>
								</Accordion.Item>
								<Accordion.Item value="father" class="!border-b-0">
									<Accordion.Trigger
										class="w-full cursor-pointer px-0 py-0 text-sm font-medium hover:no-underline"
									>
										Información del padre
									</Accordion.Trigger>
									<Accordion.Content class="mt-2 ml-4 pl-4">
										<div class="grid gap-1.5">
											<div>
												<span class="font-medium">Nombre:</span>
												{data.patient.fatherName || '-'}
											</div>
											<div>
												<span class="font-medium">Edad:</span>
												{ageFromDob(data.patient.fatherDob) ?? '-'}
											</div>
											<div>
												<span class="font-medium">Fecha de nacimiento:</span>
												{formatDateUy(data.patient.fatherDob)}
											</div>
											<div>
												<span class="font-medium">Ocupación:</span>
												{data.patient.fatherOccupation ?? '-'}
											</div>
											<div>
												<span class="font-medium">Teléfono:</span>
												{data.patient.fatherPhone ?? '-'}
											</div>
										</div>
									</Accordion.Content>
								</Accordion.Item>
							</Accordion.Root>
						</dd>
					</div>
					<div>
						<dt class="font-medium">Cantidad de hermanos</dt>
						<dd>{data.patient.siblingsCount ?? '-'}</dd>
					</div>
				</dl>
				<dl class="mt-4 text-sm">
					<div>
						<dt class="font-medium">Notas</dt>
						<dd>{data.patient.familyNotes || '-'}</dd>
					</div>
				</dl>
			</section>
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[820px]">
				<form method="POST" action="?/family" use:enhanceFamilyEdit>
					<Dialog.Header
						><Dialog.Title>Editar grupo familiar</Dialog.Title><Dialog.Description
							>Actualizá los campos de núcleo familiar.</Dialog.Description
						></Dialog.Header
					>
					<div class="space-y-4 py-4">
						<div class="grid gap-4 rounded-md border p-4 md:grid-cols-2">
							<Form.Field form={familyEditForm} name="motherName">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="motherName">Nombre completo de la madre</Label>
										<Input id="motherName" {...props} bind:value={$familyEditData.motherName} />
										<input type="hidden" name="motherName" value={$familyEditData.motherName} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={familyEditForm} name="motherDob">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label>Fecha de nacimiento</Label>
										<DatePicker max="today" bind:value={$familyEditData.motherDob} />
										<input type="hidden" name="motherDob" value={$familyEditData.motherDob} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={familyEditForm} name="motherOccupation">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="motherOccupation">Ocupación</Label>
										<Input
											id="motherOccupation"
											{...props}
											bind:value={$familyEditData.motherOccupation}
										/>
										<input
											type="hidden"
											name="motherOccupation"
											value={$familyEditData.motherOccupation}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={familyEditForm} name="motherPhone">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="motherPhone">Teléfono</Label>
										<PhoneInput
											defaultCountry="UY"
											bind:value={$familyEditData.motherPhone}
											placeholder="+598 99 123 456"
										/>
										<input type="hidden" name="motherPhone" value={$familyEditData.motherPhone} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<div class="grid gap-4 rounded-md border p-4 md:grid-cols-2">
							<Form.Field form={familyEditForm} name="fatherName">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="fatherName">Nombre completo del padre</Label>
										<Input id="fatherName" {...props} bind:value={$familyEditData.fatherName} />
										<input type="hidden" name="fatherName" value={$familyEditData.fatherName} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={familyEditForm} name="fatherDob">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label>Fecha de nacimiento</Label>
										<DatePicker max="today" bind:value={$familyEditData.fatherDob} />
										<input type="hidden" name="fatherDob" value={$familyEditData.fatherDob} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={familyEditForm} name="fatherOccupation">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="fatherOccupation">Ocupación</Label>
										<Input
											id="fatherOccupation"
											{...props}
											bind:value={$familyEditData.fatherOccupation}
										/>
										<input
											type="hidden"
											name="fatherOccupation"
											value={$familyEditData.fatherOccupation}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={familyEditForm} name="fatherPhone">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="fatherPhone">Teléfono</Label>
										<PhoneInput
											defaultCountry="UY"
											bind:value={$familyEditData.fatherPhone}
											placeholder="+598 99 123 456"
										/>
										<input type="hidden" name="fatherPhone" value={$familyEditData.fatherPhone} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<div class="grid gap-4 md:grid-cols-2">
							<Form.Field form={familyEditForm} name="siblingsCount">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="siblingsCount">Cantidad de hermanos</Label>
										<Input
											id="siblingsCount"
											{...props}
											type="number"
											min="0"
											bind:value={$familyEditData.siblingsCount}
										/>
										<input
											type="hidden"
											name="siblingsCount"
											value={$familyEditData.siblingsCount}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={familyEditForm} name="familyNotes">
								<Form.Control>
									{#snippet children({ props }: { props: Record<string, any> })}
										<Label for="familyNotes">Notas</Label>
										<Textarea
											id="familyNotes"
											{...props}
											bind:value={$familyEditData.familyNotes}
										/>
										<input type="hidden" name="familyNotes" value={$familyEditData.familyNotes} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
					</div>
					<Dialog.Footer>
						<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}
							>Cancelar</Dialog.Close
						>
						<Button type="submit" disabled={$submittingFamilyEdit}>
							{#if $submittingFamilyEdit}
								<span
									class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								></span>
								Guardando...
							{:else}
								Guardar cambios
							{/if}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>

		<div class="mb-4 break-inside-avoid">
		<Dialog.Root bind:open={openTreatmentsDialog}>
			<section class="group rounded-lg border border-slate-900/15 bg-white/80 p-4 shadow-sm lg:p-5">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<Heart size={20} />
					<span class="mr-auto">Tratamientos</span>
					{#if data.canManage}
						<Dialog.Trigger
							class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
								' h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
							onclick={openTreatmentsModal}><Pencil size={16} /></Dialog.Trigger
						>
					{/if}
				</h2>
				<dl class="text-sm">
					<div>
						<dt class="font-medium">Tratamientos</dt>
						<dd>
							{activeTreatments.length ? activeTreatments.join(', ') : 'Sin tratamientos marcados'}
						</dd>
					</div>
				</dl>
				<dl class="mt-4 text-sm">
					<div>
						<dt class="font-medium">Asignaciones</dt>
						{#if persistedTreatmentAssignments.length}
							<dd>
								<ul class="mt-1 space-y-1">
									{#each persistedTreatmentAssignments as assignment}
										<li class="text-slate-700">
											{formatTreatmentAssignment(assignment)}
										</li>
									{/each}
								</ul>
							</dd>
						{:else}
							<dd>-</dd>
						{/if}
					</div>
				</dl>
				<dl class="mt-4 text-sm">
					<div>
						<dt class="font-medium">Notas</dt>
						<dd>{persistedPatientNotes || '-'}</dd>
					</div>
				</dl>
			</section>
			<Dialog.Content
				class="max-h-[90vh] overflow-y-auto sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl"
			>
				<form
					method="POST"
					action="?/treatments"
					use:enhanceTreatmentsEdit
					onsubmit={writeModalToForm}
				>
					<Dialog.Header
						><Dialog.Title>Editar tratamientos</Dialog.Title><Dialog.Description
							>Marcá tratamientos y nota general.</Dialog.Description
						></Dialog.Header
					>
					<div class="grid gap-4 py-4">
						<Form.Field form={treatmentsEditForm} name="treatmentAssignments">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<Label>Asignaciones</Label>
										<button
											type="button"
											class="w-full rounded-md border px-3 py-2 text-sm hover:cursor-pointer sm:w-auto"
											onclick={addModalTreatmentAssignment}
										>
											Agregar tratamiento
										</button>
									</div>

									{#if modalTreatmentAssignments.length > 0}
										<div class="space-y-3">
											{#each modalTreatmentAssignments as assignment, index (index)}
												<div class="rounded-md border p-4 sm:p-5">
													<div
														class="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(11.5rem,0.9fr)] xl:items-end"
													>
														<div>
															<Label>Tratamiento</Label>
															<Select.Root
																type="single"
																value={assignment.treatmentType}
																onValueChange={(value) =>
																	updateModalTreatmentAssignment(
																		index,
																		'treatmentType',
																		value as string
																	)}
															>
																<Select.Trigger class="w-full justify-between">
																	{getOptionLabel(
																		treatmentOptions,
																		assignment.treatmentType,
																		'Seleccionar'
																	)}
																</Select.Trigger>
																<Select.Content>
																	{#each treatmentOptions as option (option.value)}
																		<Select.Item value={option.value} label={option.label}>
																			{option.label}
																		</Select.Item>
																	{/each}
																</Select.Content>
															</Select.Root>
														</div>

														<div>
															<Label>Nombre de profesional</Label>
															<Input
																value={assignment.professionalName}
																oninput={(event: Event) =>
																	updateModalTreatmentAssignment(
																		index,
																		'professionalName',
																		(event.currentTarget as HTMLInputElement).value
																	)}
															/>
														</div>

														<div>
															<Label>Día</Label>
															<Select.Root
																type="single"
																value={assignment.day}
																onValueChange={(value) =>
																	updateModalTreatmentAssignment(index, 'day', value as string)}
															>
																<Select.Trigger class="w-full justify-between">
																	{getOptionLabel(
																		treatmentDayOptions,
																		assignment.day,
																		'Seleccionar'
																	)}
																</Select.Trigger>
																<Select.Content>
																	{#each treatmentDayOptions as option (option.value)}
																		<Select.Item value={option.value} label={option.label}>
																			{option.label}
																		</Select.Item>
																	{/each}
																</Select.Content>
															</Select.Root>
														</div>

														<div>
															<Label for={`modal-treatment-hour-${index}`}>Horario</Label>
															<div class="grid grid-cols-2 gap-2">
																<Select.Root
																	type="single"
																	value={getTimeParts(assignment.time).hour}
																	onValueChange={(value) =>
																		updateModalTreatmentAssignmentTimePart(
																			index,
																			'hour',
																			value as string
																		)}
																>
																	<Select.Trigger
																		id={`modal-treatment-hour-${index}`}
																		class="w-full justify-between"
																	>
																		{getOptionLabel(
																			treatmentHourOptions,
																			getTimeParts(assignment.time).hour,
																			'Hora'
																		)}
																	</Select.Trigger>
																	<Select.Content>
																		{#each treatmentHourOptions as option (option.value)}
																			<Select.Item value={option.value} label={option.label}>
																				{option.label}
																			</Select.Item>
																		{/each}
																	</Select.Content>
																</Select.Root>

																<Select.Root
																	type="single"
																	value={getTimeParts(assignment.time).minute}
																	onValueChange={(value) =>
																		updateModalTreatmentAssignmentTimePart(
																			index,
																			'minute',
																			value as string
																		)}
																>
																	<Select.Trigger
																		id={`modal-treatment-minute-${index}`}
																		class="w-full justify-between"
																	>
																		{getOptionLabel(
																			treatmentMinuteOptions,
																			getTimeParts(assignment.time).minute,
																			'Min'
																		)}
																	</Select.Trigger>
																	<Select.Content>
																		{#each treatmentMinuteOptions as option (option.value)}
																			<Select.Item value={option.value} label={option.label}>
																				{option.label}
																			</Select.Item>
																		{/each}
																	</Select.Content>
																</Select.Root>
															</div>
														</div>
													</div>

													<div class="mt-3 flex justify-end">
														<button
															type="button"
															class={buttonVariants({ variant: 'destructiveOutline', size: 'sm' }) +
																' w-full gap-2 sm:w-auto'}
															onclick={() => removeModalTreatmentAssignment(index)}
														>
															<Trash2 size={16} />
															Eliminar fila
														</button>
													</div>
												</div>
											{/each}
										</div>
									{:else}
										<p class="text-sm text-slate-600">Todavía no hay tratamientos cargados.</p>
									{/if}

									<input
										{...props}
										type="hidden"
										name="treatmentAssignments"
										value={modalTreatmentAssignmentsSerialized}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={treatmentsEditForm} name="treatmentsNotes">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<div class="grid gap-3">
										<Label for="treatmentsNotes">Notas</Label>
										<Textarea
											id="treatmentsNotes"
											{...props}
											bind:value={modalTreatmentNotes}
											oninput={writeModalToForm}
										/>
										<input type="hidden" name="treatmentsNotes" value={modalTreatmentNotes} />
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<Dialog.Footer class="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<Dialog.Close
							type="button"
							class={buttonVariants({ variant: 'outline' }) + ' w-full sm:w-auto'}
							onclick={cancelTreatmentsModal}>Cancelar</Dialog.Close
						>
						<Button
							type="submit"
							class="w-full sm:w-auto"
							disabled={$submittingTreatmentsEdit}
						>
							{#if $submittingTreatmentsEdit}
								<span
									class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								></span>
								Guardando...
							{:else}
								Guardar cambios
							{/if}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>
	</div>

	{#if data.canManage}
		<div class="space-y-3">
			{#if data.patient.createdByEmail || data.patient.createdAtLabel}
				<p class="text-sm text-muted-foreground">
					Creado por {data.patient.createdByEmail ?? 'usuario desconocido'} el{' '}
					{data.patient.createdAtLabel ?? '-'}
				</p>
			{/if}
			<div class="flex justify-end">
			<AlertDialog.Root>
				<AlertDialog.Trigger
					class={buttonVariants({ variant: 'destructive', size: 'sm' }) + ' cursor-pointer gap-2'}
					disabled={deletingPatient}
				>
					<Trash2 size={16} />
					Eliminar paciente
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>¿Eliminar paciente?</AlertDialog.Title>
						<AlertDialog.Description>
							Esta acción eliminará la inscripción y todos los datos del paciente en forma
							permanente.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel disabled={deletingPatient}>Cancelar</AlertDialog.Cancel>
						<form method="POST" action="?/delete" use:kitEnhance={enhanceDelete}>
							<AlertDialog.Action
								type="submit"
								disabled={deletingPatient}
								class={buttonVariants({ variant: 'destructive', size: 'sm' }) +
									' flex min-w-28 cursor-pointer items-center justify-center gap-2'}
							>
								{#if deletingPatient}
									<span
										class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
									></span>
									Eliminando...
								{:else}
									Eliminar
								{/if}
							</AlertDialog.Action>
						</form>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
			</div>
		</div>
	{/if}
</div>
