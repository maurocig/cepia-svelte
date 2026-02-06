<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { enrollmentSchema, type EnrollmentSchema } from './schema';

	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import DatePicker from '@/components/DatePicker.svelte';
	import type { Infer } from 'zod/v4';

	let { data }: { data: { form: SuperValidated<Infer<EnrollmentSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(enrollmentSchema)
	});

	const { form: formData, enhance } = form;
</script>

<h1 class="mb-4 text-xl">Nuevo ingreso de paciente</h1>

<form method="POST" use:enhance>
	<div class="grid gap-3 md:grid-cols-3 md:gap-4">
		<!-- Estado de inscripción -->
		<Form.Field {form} name="enrollmentStatus">
			<Form.Control>
				{#snippet children({ props }: { props: Record<string, any> })}
					<Form.Label>Estado de inscripción</Form.Label>
					<Select.Root type="single" bind:value={$formData.enrollmentStatus}>
						<Select.Trigger {...props} class="h-10 w-full justify-between">
							{#if $formData.enrollmentStatus === 'active'}
								Activo
							{:else if $formData.enrollmentStatus === 'inactive'}
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

					<!-- Non-native controls need a hidden input so the POST includes the value -->
					<input type="hidden" name="enrollmentStatus" value={$formData.enrollmentStatus} />
				{/snippet}
			</Form.Control>
			<Form.Description
				>Indica si la inscripción del paciente se encuentra vigente.</Form.Description
			>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Fecha de inscripción -->
		<Form.Field {form} name="admissionDate">
			<Form.Control>
				{#snippet children({ props }: { props: Record<string, any> })}
					<Form.Label>Fecha de inscripción</Form.Label>
					<DatePicker bind:value={$formData.admissionDate} />
					<input type="hidden" name="admissionDate" value={$formData.admissionDate} />
				{/snippet}
			</Form.Control>
			<Form.Description>Fecha en que se inscribió al paciente.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Modo de inscripción -->
		<Form.Field {form} name="admissionMode">
			<Form.Control>
				{#snippet children({ props }: { props: Record<string, any> })}
					<Form.Label>Modo de inscripción</Form.Label>

					<Select.Root
						type="single"
						bind:value={$formData.admissionMode}
						onValueChange={(v) => {
							if (v !== 'agreement') {
								$formData.agreementOrganization = '';
								$formData.agreementOtherName = '';
							}
						}}
					>
						<Select.Trigger {...props} class="h-10 w-full justify-between">
							{#if $formData.admissionMode === 'private'}
								Particular
							{:else if $formData.admissionMode === 'agreement'}
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

					<input type="hidden" name="admissionMode" value={$formData.admissionMode} />
				{/snippet}
			</Form.Control>
			<Form.Description
				>Indica si el paciente es beneficiario de un convenio con la institución.</Form.Description
			>
			<Form.FieldErrors />
		</Form.Field>

		{#if $formData.admissionMode === 'agreement'}
			<!-- Institución responsable del convenio -->
			<Form.Field {form} name="agreementOrganization">
				<Form.Control>
					{#snippet children({ props }: { props: Record<string, any> })}
						<Form.Label>Institución responsable del convenio</Form.Label>

						<Select.Root
							type="single"
							bind:value={$formData.agreementOrganization}
							onValueChange={(v) => {
								if (v !== 'other') {
									$formData.agreementOtherName = '';
								}
							}}
						>
							<Select.Trigger {...props} class="h-10 w-full justify-between">
								{#if $formData.agreementOrganization === 'BPS'}
									Banco de Previsión Social
								{:else if $formData.agreementOrganization === 'militarTutorship'}
									Tutela militar
								{:else if $formData.agreementOrganization === 'policeTutorship'}
									Tutela policial
								{:else if $formData.agreementOrganization === 'other'}
									Otro
								{:else}
									Seleccionar
								{/if}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="BPS" label="Banco de Previsión Social"
									>Banco de Previsión Social</Select.Item
								>
								<Select.Item value="militarTutorship" label="Tutela militar"
									>Tutela militar</Select.Item
								>
								<Select.Item value="policeTutorship" label="Tutela policial"
									>Tutela policial</Select.Item
								>
								<Select.Item value="other" label="Otro">Otro</Select.Item>
							</Select.Content>
						</Select.Root>

						<input
							type="hidden"
							name="agreementOrganization"
							value={$formData.agreementOrganization}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>Nombre de la institución que brinda el convenio.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			{#if $formData.agreementOrganization === 'other'}
				<!-- Otro nombre de convenio (native input posts normally) -->
				<Form.Field {form} name="agreementOtherName">
					<Form.Control>
						{#snippet children({ props }: { props: Record<string, any> })}
							<Form.Label>Nombre de institución</Form.Label>
							<Input
								{...props}
								bind:value={$formData.agreementOtherName}
								type="text"
								placeholder="Ingrese el nombre de la institución"
							/>
							<input type="hidden" name="agreementOtherName" value={$formData.agreementOtherName} />
						{/snippet}
					</Form.Control>
					<Form.Description
						>Especifique el nombre de la institución que brinda el convenio.</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
		{/if}
	</div>

	<Form.Button type="submit" class="mt-6 w-[200px]">Guardar</Form.Button>
</form>

<pre class="mt-6 text-xs opacity-70">
  {JSON.stringify($formData, null, 2)}
</pre>
