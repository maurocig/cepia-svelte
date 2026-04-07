<script lang="ts">
	import { goto } from '$app/navigation';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { enrollmentSchema, type EnrollmentSchema } from '$lib/schemas/enrollment';
	import { patientSchema, type PatientStep2 } from '$lib/schemas/patient';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import { Input } from '$lib/components/ui/input/index.js';
	import { PhoneInput } from '$lib/components/ui/phone-input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import {
		admissionModeOptions,
		agreementOrganizationOptions,
		getOptionLabel,
		idTypeOptions,
		schoolShiftOptions,
		schoolTypeOptions,
		treatmentDayOptions,
		treatmentTimeOptions
	} from '$lib/domain/select-options';
	import {
		emptyTreatmentAssignment,
		parseTreatmentAssignments,
		treatmentOptions,
		type TreatmentAssignment
	} from '$lib/treatments';
	import { sanitizeDocumentNumber } from '$lib/utils.js';
	import DatePicker from '@/components/DatePicker.svelte';
	import Checkbox from '@/components/ui/checkbox/checkbox.svelte';
	import { Plus, Trash2 } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { toast } from 'svelte-french-toast';
	import type { Infer } from 'zod/v4';

	let {
		data
	}: {
		data: {
			enrollmentForm: SuperValidated<Infer<EnrollmentSchema>>;
			patientForm: SuperValidated<PatientStep2>;
		};
	} = $props();

	// wizard
	let step = $state<'1' | '2'>('1');
	let previousStep = $state<'1' | '2'>(step);

	function scrollUp() {
		if (typeof window === 'undefined') return;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	const enrollmentForm = superForm(data.enrollmentForm, {
		validators: zod4Client(enrollmentSchema),
		dataType: 'json',
		validationMethod: 'auto',
		resetForm: false,
		onResult: async ({ result }) => {
			if (result.type === 'redirect') {
				await goto(result.location);
				return;
			}
			scrollUp();
			if (result.type === 'failure') {
				toast.error(result.data?.message ?? 'No se pudo guardar la inscripción.');
				return;
			}

			if (result.type !== 'success') return;
			const id = result.data?.enrollmentId as string | undefined;
			if (!id) return;

			enrollmentId = id;

			// CLAVE: mientras superforms rehidrata, NO marques como validado
			enrollmentValid = false;

			// esperar a que superforms termine de rehidratar/normalizar el store
			await tick();
			savedStep1Key = step1Key($enrollmentData);

			// ahora sí: step 1 queda validado y podés avanzar sin que el effect rebote
			enrollmentValid = true;
			step = '2';
		}
	});

	const {
		form: enrollmentData,
		enhance: enhanceStep1,
		submitting: submittingStep1
	} = enrollmentForm;

	const patientForm = superForm(data.patientForm, {
		validators: zod4Client(patientSchema),
		validationMethod: 'auto',
		resetForm: false,
		onResult: async ({ result }) => {
			if (result.type === 'redirect') {
				await goto(result.location);
				return;
			}
			scrollUp();
			if (result.type === 'failure') {
				toast.error(result.data?.message ?? 'No se pudo completar el alta del paciente.');
				return;
			}
		}
	});

	const { form: patientData, enhance: enhanceStep2, submitting: submittingStep2 } = patientForm;

	if ($patientData.motherName === undefined) $patientData.motherName = '';
	if ($patientData.fatherName === undefined) $patientData.fatherName = '';
	if ($patientData.enrolledDob === undefined) $patientData.enrolledDob = '';
	if ($patientData.motherDob === undefined) $patientData.motherDob = '';
	if ($patientData.fatherDob === undefined) $patientData.fatherDob = '';
	if ($patientData.motherPhone === undefined) $patientData.motherPhone = '';
	if ($patientData.fatherPhone === undefined) $patientData.fatherPhone = '';

	let enrollmentValid = $state(false);
	let enrollmentId = $state('');

	let savedStep1Key = $state('');

	const step1Key = (d: typeof $enrollmentData) =>
		JSON.stringify({
			enrollmentStatus: d.enrollmentStatus,
			admissionDate: d.admissionDate,
			admissionMode: d.admissionMode ?? null,
			agreementOrganization: d.agreementOrganization,
			agreementOtherName: d.agreementOtherName,
			agreementExpirationDate: d.agreementExpirationDate,
			treatmentAssignments: d.treatmentAssignments,

			holderFirstName: d.holderFirstName,
			holderLastName: d.holderLastName,
			holderIdType: d.holderIdType,
			holderIdNumber: d.holderIdNumber,
			holderPhone: d.holderPhone,
			holderEmail: d.holderEmail,
			treatmentsNotes: d.treatmentsNotes
		});

	$effect(() => {
		if (step !== previousStep) {
			scrollUp();
			previousStep = step;
		}
	});

	$effect(() => {
		// IMPORTANTÍSIMO:
		// solo chequeamos “dirty” cuando el usuario está en el paso 1.
		// así evitamos rebotes por updates internos de Select/DatePicker/superforms.
		if (step !== '1') return;

		if (!enrollmentId) return;
		if (!enrollmentValid) return;
		if (!savedStep1Key) return;

		const current = step1Key($enrollmentData);
		if (current !== savedStep1Key) {
			enrollmentValid = false;
		}
	});

	function assignmentsEqual(a: TreatmentAssignment[], b: TreatmentAssignment[]) {
		if (a.length !== b.length) return false;
		return a.every(
			(item, index) =>
				item.treatmentType === b[index]?.treatmentType &&
				item.day === b[index]?.day &&
				item.time === b[index]?.time &&
				item.professionalName === b[index]?.professionalName
		);
	}

	let treatmentAssignments = $state<TreatmentAssignment[]>([]);
	let treatmentAssignmentsSerialized = $state('[]');

	function writeTreatmentAssignmentsToForm() {
		treatmentAssignmentsSerialized = JSON.stringify(treatmentAssignments);
		($enrollmentData as { treatmentAssignments: unknown }).treatmentAssignments =
			treatmentAssignmentsSerialized;
	}

	function addTreatmentAssignment() {
		treatmentAssignments = [...treatmentAssignments, emptyTreatmentAssignment()];
		writeTreatmentAssignmentsToForm();
	}

	function updateTreatmentAssignment(index: number, key: keyof TreatmentAssignment, value: string) {
		const next = treatmentAssignments.map((assignment, currentIndex) =>
			currentIndex === index ? { ...assignment, [key]: value } : { ...assignment }
		);
		treatmentAssignments = next;
		writeTreatmentAssignmentsToForm();
	}

	function removeTreatmentAssignment(index: number) {
		treatmentAssignments = treatmentAssignments.filter((_, currentIndex) => currentIndex !== index);
		writeTreatmentAssignmentsToForm();
	}

	$effect(() => {
		const parsed = parseTreatmentAssignments($enrollmentData.treatmentAssignments);
		if (!assignmentsEqual(parsed, treatmentAssignments)) treatmentAssignments = parsed;
		const nextSerialized = JSON.stringify(parsed);
		if (treatmentAssignmentsSerialized !== nextSerialized) {
			treatmentAssignmentsSerialized = nextSerialized;
		}
	});

	function back() {
		if (step === '2') {
			step = '1';
			scrollUp();
		}
	}
</script>

<h1 class="mb-4 text-xl font-semibold">Ingresar nuevo paciente</h1>

<!-- progreso -->
<div class="mb-4 flex items-center gap-3 text-sm">
	<span class="text-md px-2 py-1 font-semibold">Paso {step} de 2</span>
	<div class="bg-muted h-2 flex-1 rounded-full">
		<div
			class="h-2 rounded-full bg-emerald-600 transition-all"
			style="width: {step === '1' ? '50%' : step === '2' ? '100%' : '100%'}"
		></div>
	</div>
</div>

<!-- Tabs -->
<Tabs.Root bind:value={step}>
	<Tabs.List class="mb-6 grid w-full grid-cols-2">
		<Tabs.Trigger value="1">1. Inscripción</Tabs.Trigger>
		<Tabs.Trigger value="2" disabled={!enrollmentId || !enrollmentValid}>2. Paciente</Tabs.Trigger>
	</Tabs.List>

	<!-- ===================== -->
	<!-- STEP 1: INSCRIPCIÓN   -->
	<!-- ===================== -->
	<Tabs.Content value="1" class="space-y-6">
		<form method="POST" action="?/saveEnrollment" use:enhanceStep1>
			<input type="hidden" name="enrollmentId" value={enrollmentId} />
			<h2 class="mb-4 text-base font-semibold">Detalles de la inscripción</h2>

			<div class="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
				<!-- Estado de inscripción -->
				<Form.Field form={enrollmentForm} name="enrollmentStatus">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Estado de inscripción</Form.Label>
							<Select.Root type="single" bind:value={$enrollmentData.enrollmentStatus}>
								<Select.Trigger {...props} class="min-h-10 w-full justify-between">
									{#if $enrollmentData.enrollmentStatus === 'active'}
										Activo
									{:else if $enrollmentData.enrollmentStatus === 'inactive'}
										Inactivo
									{:else}
										Seleccionar
									{/if}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="active" label="Activo">Activo</Select.Item>
									<Select.Item value="inactive" label="Inactivo">Inactivo</Select.Item>
								</Select.Content>
							</Select.Root>
							<input
								type="hidden"
								name="enrollmentStatus"
								value={$enrollmentData.enrollmentStatus}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description
						>Indica si la inscripción del paciente se encuentra vigente.</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Fecha de inscripción -->
				<Form.Field form={enrollmentForm} name="admissionDate">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Fecha de inscripción</Form.Label>
							<DatePicker max="today" bind:value={$enrollmentData.admissionDate} />
							<input type="hidden" name="admissionDate" value={$enrollmentData.admissionDate} />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description>Fecha en que se inscribió al paciente.</Form.Description> -->
					<Form.FieldErrors />
				</Form.Field>

				<!-- Modo de inscripción -->
				<Form.Field form={enrollmentForm} name="admissionMode">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Modo de inscripción</Form.Label>
							<Select.Root
								type="single"
								bind:value={$enrollmentData.admissionMode}
								onValueChange={(v) => {
									if (v !== 'agreement') {
										$enrollmentData.agreementOrganization = '';
										$enrollmentData.agreementOtherName = '';
										$enrollmentData.agreementExpirationDate = '';
									}
								}}
							>
								<Select.Trigger {...props} class="min-h-10 w-full justify-between">
									{getOptionLabel(
										admissionModeOptions,
										$enrollmentData.admissionMode,
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
							<input type="hidden" name="admissionMode" value={$enrollmentData.admissionMode} />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description>
							Indica si el paciente es beneficiario de un convenio con la institución.
						</Form.Description> -->
					<Form.FieldErrors />
				</Form.Field>

				<!-- Convenios -->
				{#if $enrollmentData.admissionMode === 'agreement'}
					<Form.Field form={enrollmentForm} name="agreementOrganization">
						<Form.Control>
							{#snippet children({ props }: { props: Record<string, any> })}
								<Form.Label>Institución responsable del convenio</Form.Label>
								<Select.Root
									type="single"
									bind:value={$enrollmentData.agreementOrganization}
									onValueChange={(v) => {
										if (v !== 'other') {
											$enrollmentData.agreementOtherName = '';
										}
										if (v !== 'BPS') {
											$enrollmentData.agreementExpirationDate = '';
										}
									}}
								>
									<Select.Trigger {...props} class="min-h-10 w-full justify-between">
										{getOptionLabel(
											agreementOrganizationOptions,
											$enrollmentData.agreementOrganization,
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
									value={$enrollmentData.agreementOrganization}
								/>
							{/snippet}
						</Form.Control>
						<!-- <Form.Description>Nombre de la institución que brinda el convenio.</Form.Description> -->
						<Form.FieldErrors />
					</Form.Field>

					<!-- Otras instituciones -->
					{#if $enrollmentData.agreementOrganization === 'other'}
						<Form.Field form={enrollmentForm} name="agreementOtherName">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Nombre de institución</Form.Label>
									<Input
										{...props}
										bind:value={$enrollmentData.agreementOtherName}
										type="text"
										placeholder="Ingrese el nombre de la institución"
									/>
									<input
										type="hidden"
										name="agreementOtherName"
										value={$enrollmentData.agreementOtherName}
									/>
								{/snippet}
							</Form.Control>
							<!-- <Form.Description>
									Especifique el nombre de la institución que brinda el convenio.
								</Form.Description> -->
							<Form.FieldErrors />
						</Form.Field>
					{/if}

					{#if $enrollmentData.agreementOrganization === 'BPS'}
						<!-- Vencimiento del convenio -->
						<Form.Field form={enrollmentForm} name="agreementExpirationDate">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Vencimiento del convenio</Form.Label>
									<DatePicker min="today" bind:value={$enrollmentData.agreementExpirationDate} />
									<input
										type="hidden"
										name="agreementExpirationDate"
										value={$enrollmentData.agreementExpirationDate}
									/>
								{/snippet}
							</Form.Control>
							<!-- <Form.Description
										>Fecha hasta la cual el convenio se encuentra vigente.</Form.Description
									> -->
							<Form.FieldErrors />
						</Form.Field>
					{/if}
				{/if}
			</div>

			<h2 class="mt-6 mb-1 text-base font-semibold">Información del Titular</h2>
			<p class="mb-4 text-sm text-slate-500">
				Ingresá los datos de la persona que inició el trámite.
			</p>
			<div class="mb-4 grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
				<Form.Field form={enrollmentForm} name="holderFirstName">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Nombre</Form.Label>
							<Input {...props} bind:value={$enrollmentData.holderFirstName} placeholder="Nombre" />
							<input type="hidden" name="holderFirstName" value={$enrollmentData.holderFirstName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={enrollmentForm} name="holderLastName">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Apellido</Form.Label>
							<Input
								{...props}
								bind:value={$enrollmentData.holderLastName}
								placeholder="Apellido"
							/>
							<input type="hidden" name="holderLastName" value={$enrollmentData.holderLastName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={enrollmentForm} name="holderEmail">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Email</Form.Label>
							<Input
								{...props}
								type="email"
								bind:value={$enrollmentData.holderEmail}
								placeholder="titular@correo.com"
							/>
							<input type="hidden" name="holderEmail" value={$enrollmentData.holderEmail} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="grid gap-3 md:gap-4 lg:grid-cols-3">
				<Form.Field form={enrollmentForm} name="holderIdType">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Tipo de documento</Form.Label>
							<Select.Root type="single" bind:value={$enrollmentData.holderIdType}>
								<Select.Trigger {...props} class="min-h-10 w-full justify-between">
									{getOptionLabel(idTypeOptions, $enrollmentData.holderIdType, 'Seleccionar')}
								</Select.Trigger>
								<Select.Content>
									{#each idTypeOptions as option (option.value)}
										<Select.Item value={option.value} label={option.label}
											>{option.label}</Select.Item
										>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="holderIdType" value={$enrollmentData.holderIdType} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={enrollmentForm} name="holderIdNumber">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Número de documento</Form.Label>
							<Input
								{...props}
								bind:value={$enrollmentData.holderIdNumber}
								type="text"
								inputmode={$enrollmentData.holderIdType === 'PAS' ? 'text' : 'numeric'}
								pattern={$enrollmentData.holderIdType === 'PAS' ? '[A-Za-z0-9]*' : '[0-9]*'}
								oninput={(e: Event) => {
									const target = e.currentTarget as HTMLInputElement;
									const normalized = sanitizeDocumentNumber(
										target.value,
										$enrollmentData.holderIdType
									);
									target.value = normalized;
									$enrollmentData.holderIdNumber = normalized;
								}}
								placeholder="Ej: 12345678"
							/>
							<input type="hidden" name="holderIdNumber" value={$enrollmentData.holderIdNumber} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={enrollmentForm} name="holderPhone">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Teléfono</Form.Label>
							<PhoneInput
								defaultCountry="UY"
								bind:value={$enrollmentData.holderPhone}
								placeholder="+598 99 123 456"
							/>
							<input type="hidden" name="holderPhone" value={$enrollmentData.holderPhone} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<h2 class="mt-6 mb-4 text-base font-semibold">Tratamientos</h2>

			<div class="mt-4 space-y-4">
				<Form.Field form={enrollmentForm} name="treatmentAssignments">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<div class="flex items-center justify-between">
								<Form.Label>Asignaciones de tratamiento</Form.Label>
								<button
									type="button"
									class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:cursor-pointer"
									onclick={addTreatmentAssignment}
								>
									<Plus /> Agregar tratamiento
								</button>
							</div>

							{#if treatmentAssignments.length > 0}
								<div class="space-y-3">
									{#each treatmentAssignments as assignment, index (index)}
										<div class="rounded-md border p-4">
											<div class="grid gap-3 md:grid-cols-2">
												<div>
													<label class="text-sm font-medium" for={`treatmentType-${index}`}>
														Tratamiento
													</label>
													<Select.Root
														type="single"
														value={assignment.treatmentType}
														onValueChange={(value) =>
															updateTreatmentAssignment(index, 'treatmentType', value as string)}
													>
														<Select.Trigger
															id={`treatmentType-${index}`}
															class="min-h-10 w-full justify-between"
														>
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
													<label class="text-sm font-medium" for={`professionalName-${index}`}>
														Nombre de profesional
													</label>
													<Input
														id={`professionalName-${index}`}
														value={assignment.professionalName}
														oninput={(event: Event) =>
															updateTreatmentAssignment(
																index,
																'professionalName',
																(event.currentTarget as HTMLInputElement).value
															)}
													/>
												</div>

												<div>
													<label class="text-sm font-medium" for={`treatmentDay-${index}`}
														>Día</label
													>
													<Select.Root
														type="single"
														value={assignment.day}
														onValueChange={(value) =>
															updateTreatmentAssignment(index, 'day', value as string)}
													>
														<Select.Trigger
															id={`treatmentDay-${index}`}
															class="min-h-10 w-full justify-between"
														>
															{getOptionLabel(treatmentDayOptions, assignment.day, 'Seleccionar')}
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
													<label class="text-sm font-medium" for={`treatmentTime-${index}`}>
														Horario
													</label>
													<Select.Root
														type="single"
														value={assignment.time}
														onValueChange={(value) =>
															updateTreatmentAssignment(index, 'time', value as string)}
													>
														<Select.Trigger
															id={`treatmentTime-${index}`}
															class="min-h-10 w-full justify-between"
														>
															{getOptionLabel(treatmentTimeOptions, assignment.time, 'Seleccionar')}
														</Select.Trigger>
														<Select.Content>
															{#each treatmentTimeOptions as option (option.value)}
																<Select.Item value={option.value} label={option.label}>
																	{option.label}
																</Select.Item>
															{/each}
														</Select.Content>
													</Select.Root>
												</div>
											</div>

												<div class="mt-3 flex justify-end">
													<button
														type="button"
														class={buttonVariants({ variant: 'destructiveOutline', size: 'sm' }) +
															' gap-2'}
														onclick={() => removeTreatmentAssignment(index)}
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
								value={treatmentAssignmentsSerialized}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={enrollmentForm} name="treatmentsNotes">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<div class="space-y-2 md:col-span-3">
								<label class="text-sm font-medium" for="treatmentsNotes"
									>Notas de tratamientos</label
								>
								<textarea
									id="treatmentsNotes"
									class="bg-background min-h-[90px] w-full rounded-md border px-3 py-2 text-sm"
									bind:value={$enrollmentData.treatmentsNotes}
								></textarea>
								<input
									{...props}
									type="hidden"
									name="treatmentsNotes"
									value={$enrollmentData.treatmentsNotes}
								/>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<div class="mt-6 flex items-center justify-between">
				<button
					type="button"
					class="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
					onclick={back}
					disabled
				>
					Atrás
				</button>

				{#if enrollmentId && enrollmentValid}
					<button
						type="button"
						class="bg-foreground text-background w-[200px] rounded-md px-4 py-2 text-sm"
						onclick={() => (step = '2')}
					>
						Continuar
					</button>
				{:else}
					<Form.Button type="submit" class="w-[200px]" disabled={$submittingStep1}>
						{#if $submittingStep1}
							<span
								class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
							/>
							Guardando...
						{:else}
							{!enrollmentId ? 'Continuar' : 'Guardar cambios'}
						{/if}
					</Form.Button>
				{/if}
			</div>
		</form>
	</Tabs.Content>

	<!-- ===================== -->
	<!-- STEP 2: PACIENTE      -->
	<!-- ===================== -->
	<Tabs.Content value="2" class="space-y-6">
		<form method="POST" action="?/completePatient" use:enhanceStep2>
			<input type="hidden" name="enrollmentId" value={enrollmentId} />
			<h2 class="mb-4 text-base font-semibold">Información del paciente</h2>

			<div class="grid gap-3 md:grid-cols-3 md:gap-4">
				<Form.Field form={patientForm} name="enrolledFirstName">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Nombre</Form.Label>
							<Input {...props} bind:value={$patientData.enrolledFirstName} placeholder="Nombre" />
							<input
								type="hidden"
								name="enrolledFirstName"
								value={$patientData.enrolledFirstName}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="enrolledLastName">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Apellido</Form.Label>
							<Input {...props} bind:value={$patientData.enrolledLastName} placeholder="Apellido" />
							<input type="hidden" name="enrolledLastName" value={$patientData.enrolledLastName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="enrolledDob">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Fecha de nacimiento</Form.Label>
							<DatePicker max="today" bind:value={$patientData.enrolledDob} />
							<input type="hidden" name="enrolledDob" value={$patientData.enrolledDob} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="enrolledIdType">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Tipo de documento</Form.Label>
							<Select.Root type="single" bind:value={$patientData.enrolledIdType}>
								<Select.Trigger {...props} class="min-h-10 w-full justify-between">
									{getOptionLabel(idTypeOptions, $patientData.enrolledIdType, 'Seleccionar')}
								</Select.Trigger>
								<Select.Content>
									{#each idTypeOptions as option (option.value)}
										<Select.Item value={option.value} label={option.label}
											>{option.label}</Select.Item
										>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="enrolledIdType" value={$patientData.enrolledIdType} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="enrolledIdNumber">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Número de documento</Form.Label>
							<Input
								{...props}
								bind:value={$patientData.enrolledIdNumber}
								type="text"
								inputmode={$patientData.enrolledIdType === 'PAS' ? 'text' : 'numeric'}
								pattern={$patientData.enrolledIdType === 'PAS' ? '[A-Za-z0-9]*' : '[0-9]*'}
								oninput={(e: Event) => {
									const target = e.currentTarget as HTMLInputElement;
									const normalized = sanitizeDocumentNumber(
										target.value,
										$patientData.enrolledIdType
									);
									target.value = normalized;
									$patientData.enrolledIdNumber = normalized;
								}}
								placeholder="Ej: 12345678"
							/>
							<input type="hidden" name="enrolledIdNumber" value={$patientData.enrolledIdNumber} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="enrolledAddress">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Dirección</Form.Label>
							<Input
								{...props}
								bind:value={$patientData.enrolledAddress}
								placeholder="Calle, número, localidad"
							/>
							<input type="hidden" name="enrolledAddress" value={$patientData.enrolledAddress} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="responsibleAdultName">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Adulto responsable</Form.Label>
							<Input
								{...props}
								bind:value={$patientData.responsibleAdultName}
								placeholder="Nombre completo"
							/>
							<input
								type="hidden"
								name="responsibleAdultName"
								value={$patientData.responsibleAdultName}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="responsibleAdultPhone">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Tel. del adulto responsable</Form.Label>
							<PhoneInput
								defaultCountry="UY"
								bind:value={$patientData.responsibleAdultPhone}
								placeholder="+598 99 123 456"
							/>
							<input
								type="hidden"
								name="responsibleAdultPhone"
								value={$patientData.responsibleAdultPhone}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="consultationReason" class="md:col-span-2">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Motivo de consulta</Form.Label>
							<textarea
								{...props}
								class="bg-background min-h-[90px] w-full rounded-md border px-3 py-2 text-sm"
								bind:value={$patientData.consultationReason}
								placeholder="Breve descripción…"
							></textarea>
							<input
								type="hidden"
								name="consultationReason"
								value={$patientData.consultationReason}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={patientForm} name="attendsSchool" class="col-span-full">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<label class="flex items-center gap-2">
								<Checkbox
									class="h-5 w-5"
									checked={$patientData.attendsSchool}
									onCheckedChange={(v: boolean | 'indeterminate') =>
										($patientData.attendsSchool = Boolean(v))}
								/>
								<span class="text-sm font-medium">Asiste a centro educativo</span>
							</label>
							<input type="hidden" name="attendsSchool" value={$patientData.attendsSchool} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				{#if $patientData.attendsSchool}
					<Form.Field form={patientForm} name="schoolType">
						<Form.Control>
							{#snippet children({ props }: { props: Record<string, any> })}
								<Form.Label>Tipo de educación</Form.Label>
								<Select.Root
									type="single"
									bind:value={$patientData.schoolType}
									onValueChange={(v) => {
										if (v === 'kindergarten') {
											$patientData.schoolGrade = undefined;
										}
									}}
								>
									<Select.Trigger {...props} class="min-h-10 w-full justify-between">
										{getOptionLabel(schoolTypeOptions, $patientData.schoolType, 'Seleccionar')}
									</Select.Trigger>
									<Select.Content>
										{#each schoolTypeOptions as option (option.value)}
											<Select.Item value={option.value} label={option.label}
												>{option.label}</Select.Item
											>
										{/each}
									</Select.Content>
								</Select.Root>
								<input type="hidden" name="schoolType" value={$patientData.schoolType} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={patientForm} name="schoolGrade">
						<Form.Control>
							{#snippet children({ props }: { props: Record<string, any> })}
								<Form.Label>Grado</Form.Label>
								<Select.Root
									type="single"
									bind:value={$patientData.schoolGrade}
									disabled={$patientData.schoolType === 'kindergarten'}
								>
									<Select.Trigger {...props} class="min-h-10 w-full justify-between">
										{$patientData.schoolGrade ||
											($patientData.schoolType === 'kindergarten' ? 'No aplica' : 'Seleccionar')}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="1" label="1ro">1ro</Select.Item>
										<Select.Item value="2" label="2do">2do</Select.Item>
										<Select.Item value="3" label="3ro">3ro</Select.Item>
										<Select.Item value="4" label="4to">4to</Select.Item>
										<Select.Item value="5" label="5to">5to</Select.Item>
										<Select.Item value="6" label="6to">6to</Select.Item>
									</Select.Content>
								</Select.Root>
								<input
									type="hidden"
									name="schoolGrade"
									value={$patientData.schoolGrade}
									required={$patientData.schoolType === 'primary' ||
										$patientData.schoolType === 'secondary'}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={patientForm} name="schoolShift">
						<Form.Control>
							{#snippet children({ props }: { props: Record<string, any> })}
								<Form.Label>Turno</Form.Label>
								<Select.Root type="single" bind:value={$patientData.schoolShift}>
									<Select.Trigger {...props} class="min-h-10 w-full justify-between">
										{getOptionLabel(schoolShiftOptions, $patientData.schoolShift, 'Seleccionar')}
									</Select.Trigger>
									<Select.Content>
										{#each schoolShiftOptions as option (option.value)}
											<Select.Item value={option.value} label={option.label}
												>{option.label}</Select.Item
											>
										{/each}
									</Select.Content>
								</Select.Root>
								<input type="hidden" name="schoolShift" value={$patientData.schoolShift} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={patientForm} name="schoolName">
						<Form.Control>
							{#snippet children({ props }: { props: Record<string, any> })}
								<Form.Label>Centro educativo</Form.Label>
								<Input
									{...props}
									bind:value={$patientData.schoolName}
									placeholder="Nombre de la institución"
								/>
								<input type="hidden" name="schoolName" value={$patientData.schoolName} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				{/if}
			</div>

			<h2 class="mt-12 mb-4 text-base font-semibold">Núcleo familiar</h2>

				<div class="space-y-4">
					<div class="grid gap-3 rounded-md border p-4 md:grid-cols-5 md:gap-4">
						<Form.Field form={patientForm} name="motherName" class="md:col-span-2">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Nombre completo de la madre</Form.Label>
									<Input {...props} bind:value={$patientData.motherName} />
									<input type="hidden" name="motherName" value={$patientData.motherName} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={patientForm} name="motherDob">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Fecha de nacimiento</Form.Label>
									<DatePicker max="today" bind:value={$patientData.motherDob} />
									<input type="hidden" name="motherDob" value={$patientData.motherDob} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={patientForm} name="motherOccupation">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Ocupación</Form.Label>
									<Input {...props} bind:value={$patientData.motherOccupation} />
									<input type="hidden" name="motherOccupation" value={$patientData.motherOccupation} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={patientForm} name="motherPhone">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Teléfono</Form.Label>
									<PhoneInput
										defaultCountry="UY"
										bind:value={$patientData.motherPhone}
										placeholder="+598 99 123 456"
									/>
									<input type="hidden" name="motherPhone" value={$patientData.motherPhone} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>

					<div class="grid gap-3 rounded-md border p-4 md:grid-cols-5 md:gap-4">
						<Form.Field form={patientForm} name="fatherName" class="md:col-span-2">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Nombre completo del padre</Form.Label>
									<Input {...props} bind:value={$patientData.fatherName} />
									<input type="hidden" name="fatherName" value={$patientData.fatherName} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={patientForm} name="fatherDob">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Fecha de nacimiento</Form.Label>
									<DatePicker max="today" bind:value={$patientData.fatherDob} />
									<input type="hidden" name="fatherDob" value={$patientData.fatherDob} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={patientForm} name="fatherOccupation">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Ocupación</Form.Label>
									<Input {...props} bind:value={$patientData.fatherOccupation} />
									<input type="hidden" name="fatherOccupation" value={$patientData.fatherOccupation} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={patientForm} name="fatherPhone">
							<Form.Control>
								{#snippet children({ props }: { props: Record<string, any> })}
									<Form.Label>Teléfono</Form.Label>
									<PhoneInput
										defaultCountry="UY"
										bind:value={$patientData.fatherPhone}
										placeholder="+598 99 123 456"
									/>
									<input type="hidden" name="fatherPhone" value={$patientData.fatherPhone} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>

					<div class="grid gap-3 md:grid-cols-3 md:gap-4">
					<Form.Field form={patientForm} name="siblingsCount">
						<Form.Control>
							{#snippet children({ props }: { props: Record<string, any> })}
								<Form.Label>Cantidad de hermanos</Form.Label>
							<Input type="number" min="0" step="1" bind:value={$patientData.siblingsCount} />
							<input type="hidden" name="siblingsCount" value={$patientData.siblingsCount} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

					<Form.Field form={patientForm} name="familyNotes" class="md:col-span-3">
						<Form.Control>
							{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Notas familiares</Form.Label>
							<textarea
								{...props}
								class="bg-background min-h-[90px] w-full rounded-md border px-3 py-2 text-sm"
								bind:value={$patientData.familyNotes}
							></textarea>
							<input type="hidden" name="familyNotes" value={$patientData.familyNotes} />
						{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					</div>
				</div>
			<div class="mt-6 flex items-center justify-between">
				<button
					type="button"
					class="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
					onclick={back}
				>
					Atrás
				</button>

				<Form.Button type="submit" class="w-[200px]" disabled={$submittingStep2}>
					{#if $submittingStep2}
						<span
							class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						/>
						Guardando...
					{:else}
						Guardar
					{/if}
				</Form.Button>
			</div>
		</form>
	</Tabs.Content>
</Tabs.Root>

<!-- <pre class="mt-6 text-xs opacity-70">{JSON.stringify(
		{ enrollment: $enrollmentData, patient, family },
		null,
		2
	)}
</pre> -->
