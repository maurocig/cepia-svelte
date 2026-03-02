<script lang="ts">
	import { enhance as kitEnhance } from '$app/forms';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Checkbox from '$lib/components/ui/checkbox/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import {
		admissionModeOptions,
		agreementOrganizationOptions,
		enrollmentStatusOptions,
		getOptionLabel,
		idTypeOptions,
		schoolShiftOptions,
		schoolTypeOptions
	} from '$lib/domain/select-options';
	import {
		enrollmentEditSchema,
		familyEditSchema,
		patientEditSchema,
		responsibleEditSchema,
		schoolEditSchema,
		treatmentsEditSchema
	} from '$lib/schemas/edit-sections';
	import { ageFromDob, formatDateUy, formatPersonName, treatmentLabels } from '$lib/utils';
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
	const yesNo = (v: boolean) => (v ? 'Sí' : 'No');

	let openPatientDialog = $state(false);
	let openEnrollmentDialog = $state(false);
	let openResponsibleDialog = $state(false);
	let openSchoolDialog = $state(false);
	let openFamilyDialog = $state(false);
	let openTreatmentsDialog = $state(false);
	let deletingPatient = $state(false);

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
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				savedTreatmentValues = { ...draftTreatmentValues };
				savedTreatmentNotes = draftTreatmentNotes;
				openTreatmentsDialog = false;
				toast.success('Los tratamientos se actualizaron correctamente.');
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

	let savedTreatmentValues = $state(
		Object.fromEntries(treatmentLabels.map(([key]) => [key, Boolean(data.patient[key])])) as Record<
			string,
			boolean
		>
	);
	let savedTreatmentNotes = $state(data.patient.treatmentsNotes ?? '');
	let draftTreatmentValues = $state({ ...savedTreatmentValues });
	let draftTreatmentNotes = $state(savedTreatmentNotes);

	$effect(() => {
		if (!openTreatmentsDialog) return;
		const nextDraftValues = { ...savedTreatmentValues };
		const nextDraftNotes = savedTreatmentNotes;
		draftTreatmentValues = nextDraftValues;
		draftTreatmentNotes = nextDraftNotes;
		$treatmentsEditData = {
			psychology: nextDraftValues.psychology ?? false,
			psychomotricity: nextDraftValues.psychomotricity ?? false,
			speechTherapy: nextDraftValues.speechTherapy ?? false,
			psychopedagogy: nextDraftValues.psychopedagogy ?? false,
			pedagogicalSupport: nextDraftValues.pedagogicalSupport ?? false,
			physiotherapy: nextDraftValues.physiotherapy ?? false,
			occupationalTherapy: nextDraftValues.occupationalTherapy ?? false,
			workshops: nextDraftValues.workshops ?? false,
			treatmentsNotes: nextDraftNotes
		};
	});

	const activeTreatments = $derived(
		treatmentLabels.filter(([key]) => Boolean(savedTreatmentValues[key])).map(([, label]) => label)
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

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<Button
			href="/admin/pacientes"
			class="border border-transparent bg-transparent text-slate-600 hover:border-slate-400/20 hover:bg-transparent"
			aria-label="Volver"
		>
			<ArrowLeft strokeWidth="1.5" size={26} />
		</Button>
		<h1 class="text-xl font-semibold">
			{formatPersonName(data.patient.enrolledFirstName)}
			{formatPersonName(data.patient.enrolledLastName)}
		</h1>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<Dialog.Root bind:open={openPatientDialog}>
			<section class="group rounded-md border p-4 lg:p-6">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<User size={20} />
					<span class="mr-auto">Paciente</span>
					<Dialog.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
							' h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
					>
						<Pencil size={16} />
					</Dialog.Trigger>
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
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
				<form method="POST" action="?/patient" use:enhancePatientEdit>
					<Dialog.Header>
						<Dialog.Title>Editar paciente</Dialog.Title>
						<Dialog.Description>Actualizá los datos del paciente.</Dialog.Description>
					</Dialog.Header>
					<div class="grid gap-4 py-4">
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
						<Form.Field form={patientEditForm} name="enrolledIdType">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label>Tipo doc.</Label>
									<Select.Root type="single" bind:value={$patientEditData.enrolledIdType}>
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
										bind:value={$patientEditData.enrolledIdNumber}
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
						<Form.Field form={patientEditForm} name="enrolledAddress">
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
						<Form.Field form={patientEditForm} name="consultationReason">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="consultationReason">Motivo</Label>
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

		<Dialog.Root bind:open={openEnrollmentDialog}>
			<section class="group rounded-md border p-4 lg:p-6">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<FileText size={20} />
					<span class="mr-auto">Inscripción</span>
					<Dialog.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
							' h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
						><Pencil size={16} /></Dialog.Trigger
					>
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
								<dd>{formatDateUy(data.patient.agreementExpirationDate)}</dd>
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
						<dd>{data.patient.holderIdType ?? '-'} {data.patient.holderIdNumber}</dd>
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
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
				<form method="POST" action="?/enrollment" use:enhanceEnrollmentEdit>
					<Dialog.Header>
						<Dialog.Title>Editar inscripción</Dialog.Title>
						<Dialog.Description>Actualizá estado y condiciones de inscripción.</Dialog.Description>
					</Dialog.Header>
					<div class="grid gap-4 py-4">
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
						<Form.Field form={enrollmentEditForm} name="holderIdType">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label>Tipo de documento de titular</Label>
									<Select.Root type="single" bind:value={$enrollmentEditData.holderIdType}>
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
										bind:value={$enrollmentEditData.holderIdNumber}
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

		<Dialog.Root bind:open={openResponsibleDialog}>
			<section class="group rounded-md border p-4 lg:p-6">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<Shield size={20} />
					<span class="mr-auto">Adulto responsable</span>
					<Dialog.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
							' h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
						><Pencil size={16} /></Dialog.Trigger
					>
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
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
				<form method="POST" action="?/responsible" use:enhanceResponsibleEdit>
					<Dialog.Header
						><Dialog.Title>Editar responsable</Dialog.Title><Dialog.Description
							>Actualizá datos del adulto responsable.</Dialog.Description
						></Dialog.Header
					>
					<div class="grid gap-4 py-4">
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

		<Dialog.Root bind:open={openSchoolDialog}>
			<section class="group rounded-md border p-4 lg:p-6">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<BookMarked size={20} />
					<span class="mr-auto">Escolaridad</span>
					<Dialog.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
							' h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
						><Pencil size={16} /></Dialog.Trigger
					>
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
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
				<form method="POST" action="?/school" use:enhanceSchoolEdit>
					<Dialog.Header
						><Dialog.Title>Editar escolaridad</Dialog.Title><Dialog.Description
							>Actualizá la información educativa.</Dialog.Description
						></Dialog.Header
					>
					<div class="grid gap-4 py-4">
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
						<div class:opacity-60={!$schoolEditData.attendsSchool} class="grid gap-4">
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

	<div class="grid gap-4 lg:grid-cols-2">
		<Dialog.Root bind:open={openFamilyDialog}>
			<section class="group rounded-md border p-4 lg:p-6">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<Users size={20} />
					<span class="mr-auto">Grupo familiar</span>
					<Dialog.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
							' h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
						><Pencil size={16} /></Dialog.Trigger
					>
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
				<dl class="mt-4 text-sm">
					<div>
						<dt class="font-medium">Notas</dt>
						<dd>{data.patient.familyNotes || '-'}</dd>
					</div>
				</dl>
			</section>
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
				<form method="POST" action="?/family" use:enhanceFamilyEdit>
					<Dialog.Header
						><Dialog.Title>Editar grupo familiar</Dialog.Title><Dialog.Description
							>Actualizá los campos de núcleo familiar.</Dialog.Description
						></Dialog.Header
					>
					<div class="grid gap-4 py-4">
						<Form.Field form={familyEditForm} name="motherDob">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label>Fecha de nacimiento de la madre</Label>
									<DatePicker max="today" bind:value={$familyEditData.motherDob} />
									<input type="hidden" name="motherDob" value={$familyEditData.motherDob} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={familyEditForm} name="motherOccupation">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="motherOccupation">Ocupación madre</Label>
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
						<Form.Field form={familyEditForm} name="fatherDob">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label>Fecha de nacimiento del padre</Label>
									<DatePicker max="today" bind:value={$familyEditData.fatherDob} />
									<input type="hidden" name="fatherDob" value={$familyEditData.fatherDob} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={familyEditForm} name="fatherOccupation">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="fatherOccupation">Ocupación padre</Label>
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
									<input type="hidden" name="siblingsCount" value={$familyEditData.siblingsCount} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={familyEditForm} name="familyNotes">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Label for="familyNotes">Notas</Label>
									<Textarea id="familyNotes" {...props} bind:value={$familyEditData.familyNotes} />
									<input type="hidden" name="familyNotes" value={$familyEditData.familyNotes} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
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

		<Dialog.Root bind:open={openTreatmentsDialog}>
			<section class="group rounded-md border p-4 lg:p-6">
				<h2
					class="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-600 uppercase"
				>
					<Heart size={20} />
					<span class="mr-auto">Tratamientos</span>
					<Dialog.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
							' h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'}
						><Pencil size={16} /></Dialog.Trigger
					>
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
						<dt class="font-medium">Notas</dt>
						<dd>{savedTreatmentNotes || '-'}</dd>
					</div>
				</dl>
			</section>
			<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
				<form method="POST" action="?/treatments" use:enhanceTreatmentsEdit>
					<Dialog.Header
						><Dialog.Title>Editar tratamientos</Dialog.Title><Dialog.Description
							>Marcá tratamientos y nota general.</Dialog.Description
						></Dialog.Header
					>
					<div class="grid gap-4 py-4">
						<div class="grid gap-2">
							{#each treatmentLabels as [key, label] (key)}
								<label class="flex items-center gap-2 text-sm">
									<Checkbox.Root
										name={key}
										checked={Boolean(draftTreatmentValues[key])}
										onCheckedChange={(checked: boolean | 'indeterminate') => {
											draftTreatmentValues[key] = Boolean(checked);
											$treatmentsEditData[key] = Boolean(checked);
										}}
									/>
									<input
										type="hidden"
										name={key}
										value={$treatmentsEditData[key] ? 'true' : 'false'}
									/>
									{label}
								</label>
							{/each}
						</div>
						<Form.Field form={treatmentsEditForm} name="treatmentsNotes">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<div class="grid gap-3">
										<Label for="treatmentsNotes">Notas</Label>
										<Textarea
											id="treatmentsNotes"
											{...props}
											bind:value={draftTreatmentNotes}
											oninput={() => ($treatmentsEditData.treatmentsNotes = draftTreatmentNotes)}
										/>
										<input type="hidden" name="treatmentsNotes" value={draftTreatmentNotes} />
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<Dialog.Footer>
						<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}
							>Cancelar</Dialog.Close
						>
						<Button type="submit" disabled={$submittingTreatmentsEdit}>
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

	<div class="flex justify-end">
		<AlertDialog.Root>
			<AlertDialog.Trigger
				class={buttonVariants({ variant: 'destructive', size: 'sm' }) +
					' cursor-pointer gap-2 text-white'}
				disabled={deletingPatient}
			>
				<Trash2 size={16} />
				Eliminar paciente
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>¿Eliminar paciente?</AlertDialog.Title>
					<AlertDialog.Description>
						Esta acción eliminará la inscripción y todos los datos del paciente en forma permanente.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel disabled={deletingPatient}>Cancelar</AlertDialog.Cancel>
					<form method="POST" action="?/delete" use:kitEnhance={enhanceDelete}>
						<AlertDialog.Action
							type="submit"
							disabled={deletingPatient}
							class={buttonVariants({ variant: 'destructive', size: 'sm' }) +
								'flex min-w-28 cursor-pointer items-center justify-center gap-2 text-white'}
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
