<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { enrollmentSchema, type EnrollmentSchema } from './schema';

	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import DatePicker from '@/components/DatePicker.svelte';
	import Checkbox from '@/components/ui/checkbox/checkbox.svelte';
	import type { Infer } from 'zod/v4';

	let { data }: { data: { form: SuperValidated<Infer<EnrollmentSchema>> } } = $props();

	const enrollmentForm = superForm(data.form, {
		validators: zod4Client(enrollmentSchema)
	});

	const { form: enrollmentData, enhance, validateForm } = enrollmentForm;

	// wizard
	let step = $state<'1' | '2' | '3'>('1');

	let enrollmentValid = $state(false);
	let enrollmentSnapshot = $state('');

	async function next() {
		if (step === '1') {
			const res = await validateForm({ update: true });
			if (!res.valid) return;

			enrollmentValid = true;
			enrollmentSnapshot = JSON.stringify($enrollmentData);

			step = '2';
			return;
		}

		if (step === '2') step = '3';
	}

	function back() {
		if (step === '3') step = '2';
		else if (step === '2') step = '1';
	}

	$effect(() => {
		const current = JSON.stringify($enrollmentData);

		// si ya validaste y el usuario tocó algo, se invalida y re-bloquea el tab 2
		if (enrollmentValid && enrollmentSnapshot && current !== enrollmentSnapshot) {
			enrollmentValid = false;
			// opcional pero recomendado: si estabas en step 2, te mando al 1
			if (step !== '1') step = '1';
		}
	});

	// step 2 (datos del paciente) - por ahora fuera de superforms/zod
	// para no romper el schema actual. igual se postean como inputs normales.
	let patient = $state({
		enrolledFullName: '',
		enrolledDob: '',
		enrolledIdType: '',
		enrolledIdNumber: '',
		enrolledAddress: '',
		responsibleAdultName: '',
		responsibleAdultPhone: '',
		consultationReason: '',
		attendsSchool: false,
		schoolName: '',
		schoolGrade: '',
		schoolShift: ''
	});

	// step 3 - titular, family, treatments (local state for now)
	let holder = $state({
		holderFullName: '',
		holderIdType: '',
		holderIdNumber: '',
		holderPhone: ''
	});

	let family = $state({
		motherAge: '',
		motherOccupation: '',
		fatherAge: '',
		fatherOccupation: '',
		siblingsCount: '',
		familyNotes: ''
	});

	let treatments = $state({
		psychology: false,
		psychomotricity: false,
		speechTherapy: false,
		psychopedagogy: false,
		pedagogicalSupport: false,
		physiotherapy: false,
		occupationalTherapy: false,
		workshops: false,
		treatmentsNotes: ''
	});
</script>

<h1 class="mb-4 text-xl font-semibold">Ingresar nuevo paciente</h1>

<!-- progreso -->
<div class="mb-4 flex items-center gap-3 text-sm">
	<span class="text-md px-2 py-1 font-semibold">Paso {step} de 3</span>
	<div class="bg-muted h-2 flex-1 rounded-full">
		<div
			class="h-2 rounded-full bg-emerald-600 transition-all"
			style="width: {step === '1' ? '33%' : step === '2' ? '66%' : '100%'}"
		></div>
	</div>
</div>

<form method="POST" use:enhance>
	<Tabs.Root value={step}>
		<Tabs.List class="mb-6 grid w-full grid-cols-3">
			<Tabs.Trigger value="1">1. Inscripción</Tabs.Trigger>
			<Tabs.Trigger value="2" disabled={step === '1'}>2. Paciente</Tabs.Trigger>
			<Tabs.Trigger value="3" disabled={true}>3. Tratamientos y más</Tabs.Trigger>
		</Tabs.List>

		<!-- ===================== -->
		<!-- STEP 1: INSCRIPCIÓN   -->
		<!-- ===================== -->
		<Tabs.Content value="1" class="space-y-6">
			<div>
				<h2 class="mb-4 text-base font-semibold">Detalles de la inscripción</h2>

				<div class="grid gap-3 md:grid-cols-3 md:gap-4">
					<!-- Estado de inscripción -->
					<Form.Field form={enrollmentForm} name="enrollmentStatus">
						<Form.Control>
							{#snippet children({ props }: { props: Record<string, any> })}
								<Form.Label>Estado de inscripción</Form.Label>
								<Select.Root type="single" bind:value={$enrollmentData.enrollmentStatus}>
									<Select.Trigger {...props} class="h-10 w-full justify-between">
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
									<Select.Trigger {...props} class="h-10 w-full justify-between">
										{#if $enrollmentData.admissionMode === 'private'}
											Particular
										{:else if $enrollmentData.admissionMode === 'agreement'}
											Convenio
										{:else}
											Seleccionar
										{/if}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="private" label="Particular">Particular</Select.Item>
										<Select.Item value="agreement" label="Convenio">Convenio</Select.Item>
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
										}}
									>
										<Select.Trigger {...props} class="h-10 w-full justify-between">
											{#if $enrollmentData.agreementOrganization === 'BPS'}
												Banco de Previsión Social
											{:else if $enrollmentData.agreementOrganization === 'militarTutorship'}
												Tutela militar
											{:else if $enrollmentData.agreementOrganization === 'policeTutorship'}
												Tutela policial
											{:else if $enrollmentData.agreementOrganization === 'other'}
												Otro
											{:else}
												Seleccionar
											{/if}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="BPS" label="Banco de Previsión Social">
												Banco de Previsión Social
											</Select.Item>
											<Select.Item value="militarTutorship" label="Tutela militar">
												Tutela militar
											</Select.Item>
											<Select.Item value="policeTutorship" label="Tutela policial">
												Tutela policial
											</Select.Item>
											<Select.Item value="other" label="Otro">Otro</Select.Item>
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
				</div>
			</div>
		</Tabs.Content>

		<!-- ===================== -->
		<!-- STEP 2: PACIENTE      -->
		<!-- ===================== -->
		<Tabs.Content value="2" class="space-y-6">
			<div>
				<h2 class="mb-4 text-base font-semibold">Información del paciente</h2>

				<div class="grid gap-3 md:grid-cols-2 md:gap-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Nombre completo</label>
						<Input
							bind:value={patient.enrolledFullName}
							placeholder="Nombre y apellido (como figura en CI)"
						/>
						<input type="hidden" name="enrolledFullName" value={patient.enrolledFullName} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Fecha de nacimiento</label>
						<DatePicker bind:value={patient.enrolledDob} />
						<input type="hidden" name="enrolledDob" value={patient.enrolledDob} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Tipo de documento</label>
						<Select.Root type="single" bind:value={patient.enrolledIdType}>
							<Select.Trigger class="h-10 w-full justify-between">
								{#if patient.enrolledIdType}
									{patient.enrolledIdType}
								{:else}
									Seleccionar
								{/if}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="CI" label="CI">CI</Select.Item>
								<Select.Item value="DNI" label="DNI">DNI</Select.Item>
								<Select.Item value="PAS" label="Pasaporte">Pasaporte</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="enrolledIdType" value={patient.enrolledIdType} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Número de documento</label>
						<Input bind:value={patient.enrolledIdNumber} placeholder="Ej: 12345678" />
						<input type="hidden" name="enrolledIdNumber" value={patient.enrolledIdNumber} />
					</div>

					<div class="space-y-2 md:col-span-2">
						<label class="text-sm font-medium">Dirección</label>
						<Input bind:value={patient.enrolledAddress} placeholder="Calle, número, localidad" />
						<input type="hidden" name="enrolledAddress" value={patient.enrolledAddress} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Adulto responsable</label>
						<Input bind:value={patient.responsibleAdultName} placeholder="Nombre completo" />
						<input type="hidden" name="responsibleAdultName" value={patient.responsibleAdultName} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Tel. adulto responsable</label>
						<Input bind:value={patient.responsibleAdultPhone} placeholder="Ej: 09xxxxxxx" />
						<input
							type="hidden"
							name="responsibleAdultPhone"
							value={patient.responsibleAdultPhone}
						/>
					</div>

					<div class="space-y-2 md:col-span-2">
						<label class="text-sm font-medium">Motivo de consulta</label>
						<textarea
							class="bg-background min-h-[90px] w-full rounded-md border px-3 py-2 text-sm"
							bind:value={patient.consultationReason}
							placeholder="Breve descripción…"
						/>
						<input type="hidden" name="consultationReason" value={patient.consultationReason} />
					</div>

					<div class="flex items-center gap-2 md:col-span-2">
						<Checkbox class="h-5 w-5" bind:checked={patient.attendsSchool} />
						<span class="text-sm font-medium">Asiste a centro educativo</span>
						<input type="hidden" name="attendsSchool" value={patient.attendsSchool} />
					</div>

					{#if patient.attendsSchool}
						<div class="space-y-2 md:col-span-2">
							<label class="text-sm font-medium">Centro educativo</label>
							<Input bind:value={patient.schoolName} placeholder="Nombre" />
							<input type="hidden" name="schoolName" value={patient.schoolName} />
						</div>

						<div class="space-y-2">
							<label class="text-sm font-medium">Grado</label>
							<Input bind:value={patient.schoolGrade} placeholder="Ej: 3ro" />
							<input type="hidden" name="schoolGrade" value={patient.schoolGrade} />
						</div>

						<div class="space-y-2">
							<label class="text-sm font-medium">Turno</label>
							<Input bind:value={patient.schoolShift} placeholder="Mañana / tarde / noche" />
							<input type="hidden" name="schoolShift" value={patient.schoolShift} />
						</div>
					{/if}
				</div>
			</div>

			<div class="">
				<h2 class="mt-12 mb-4 text-base font-semibold">Núcleo familiar</h2>

				<div class="grid gap-3 md:grid-cols-3 md:gap-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Edad madre</label>
						<Input bind:value={family.motherAge} />
						<input type="hidden" name="motherAge" value={family.motherAge} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Ocupación madre</label>
						<Input bind:value={family.motherOccupation} />
						<input type="hidden" name="motherOccupation" value={family.motherOccupation} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Edad padre</label>
						<Input bind:value={family.fatherAge} />
						<input type="hidden" name="fatherAge" value={family.fatherAge} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Ocupación padre</label>
						<Input bind:value={family.fatherOccupation} />
						<input type="hidden" name="fatherOccupation" value={family.fatherOccupation} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Cantidad de hermanos</label>
						<Input bind:value={family.siblingsCount} />
						<input type="hidden" name="siblingsCount" value={family.siblingsCount} />
					</div>

					<div class="space-y-2 md:col-span-3">
						<label class="text-sm font-medium">Notas familiares</label>
						<textarea
							class="bg-background min-h-[90px] w-full rounded-md border px-3 py-2 text-sm"
							bind:value={family.familyNotes}
						/>
						<input type="hidden" name="familyNotes" value={family.familyNotes} />
					</div>
				</div>
			</div>
		</Tabs.Content>

		<!-- ===================== -->
		<!-- STEP 3: TITULAR + MÁS -->
		<!-- ===================== -->

		<Tabs.Content value="3" class="space-y-6">
			<div>
				<h2 class="mb-4 text-base font-semibold">Tratamientos</h2>

				<div class="grid gap-3 md:grid-cols-3 md:gap-4">
					<label class="flex items-center gap-2">
						<Checkbox class="h-5 w-5" bind:checked={treatments.psychology} />
						<span class="text-sm">Psicología</span>
					</label>
					<input type="hidden" name="psychology" value={treatments.psychology} />
					<label class="flex items-center gap-2">
						<Checkbox class="h-5 w-5" bind:checked={treatments.psychomotricity} />
						<span class="text-sm">Psicomotricidad</span>
					</label>
					<input type="hidden" name="psychomotricity" value={treatments.psychomotricity} />
					<label class="flex items-center gap-2">
						<Checkbox class="h-5 w-5" bind:checked={treatments.speechTherapy} />
						<span class="text-sm">Fonoaudiología</span>
					</label>
					<input type="hidden" name="speechTherapy" value={treatments.speechTherapy} />
					<label class="flex items-center gap-2">
						<Checkbox class="h-5 w-5" bind:checked={treatments.psychopedagogy} />
						<span class="text-sm">Psicopedagogía</span>
					</label>
					<input type="hidden" name="psychopedagogy" value={treatments.psychopedagogy} />
					<label class="flex items-center gap-2">
						<Checkbox class="h-5 w-5" bind:checked={treatments.pedagogicalSupport} />
						<span class="text-sm">Apoyo pedagógico</span>
					</label>
					<input type="hidden" name="pedagogicalSupport" value={treatments.pedagogicalSupport} />
					<label class="flex items-center gap-2">
						<Checkbox class="h-5 w-5" bind:checked={treatments.physiotherapy} />
						<span class="text-sm">Fisioterapia</span>
					</label>
					<input type="hidden" name="physiotherapy" value={treatments.physiotherapy} />
					<label class="flex items-center gap-2">
						<Checkbox class="h-5 w-5" bind:checked={treatments.occupationalTherapy} />
						<span class="text-sm">Terapia ocupacional</span>
					</label>
					<input type="hidden" name="occupationalTherapy" value={treatments.occupationalTherapy} />
					<label class="flex items-center gap-2">
						<Checkbox class="h-5 w-5" bind:checked={treatments.workshops} />
						<span class="text-sm">Talleres</span>
					</label>
					<input type="hidden" name="workshops" value={treatments.workshops} />
					<div class="space-y-2 md:col-span-3">
						<label class="text-sm font-medium">Notas de tratamientos</label>
						<textarea
							class="bg-background min-h-[90px] w-full rounded-md border px-3 py-2 text-sm"
							bind:value={treatments.treatmentsNotes}
						></textarea>
						<input type="hidden" name="treatmentsNotes" value={treatments.treatmentsNotes} />
					</div>
				</div>
			</div>

			<div>
				<h2 class="mb-4 text-base font-semibold">Titular</h2>
				<div class="grid gap-3 md:grid-cols-2 md:gap-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Nombre completo</label>
						<Input bind:value={holder.holderFullName} placeholder="Nombre y apellido" />
						<input type="hidden" name="holderFullName" value={holder.holderFullName} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Teléfono</label>
						<Input bind:value={holder.holderPhone} placeholder="Ej: 09xxxxxxx" />
						<input type="hidden" name="holderPhone" value={holder.holderPhone} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Tipo de documento</label>
						<Select.Root type="single" bind:value={holder.holderIdType}>
							<Select.Trigger class="h-10 w-full justify-between">
								{holder.holderIdType || 'Seleccionar'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="CI" label="CI">CI</Select.Item>
								<Select.Item value="DNI" label="DNI">DNI</Select.Item>
								<Select.Item value="PAS" label="Pasaporte">Pasaporte</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="holderIdType" value={holder.holderIdType} />
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Número de documento</label>
						<Input bind:value={holder.holderIdNumber} placeholder="Ej: 12345678" />
						<input type="hidden" name="holderIdNumber" value={holder.holderIdNumber} />
					</div>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>

	<!-- botones del wizard -->
	<div class="mt-6 flex items-center justify-between">
		<button
			type="button"
			class="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
			onclick={back}
			disabled={step === '1'}
		>
			Atrás
		</button>

		{#if step !== '3'}
			<button
				type="button"
				class="bg-foreground text-background rounded-md px-4 py-2 text-sm"
				onclick={next}
			>
				Siguiente
			</button>
		{:else}
			<Form.Button type="submit" class="w-[200px]">Guardar</Form.Button>
		{/if}
	</div>
</form>

<!-- <pre class="mt-6 text-xs opacity-70">{JSON.stringify(
		{ enrollment: $enrollmentData, patient, holder, family, treatments },
		null,
		2
	)}</pre> -->
