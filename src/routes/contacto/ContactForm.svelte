<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from './schema';

	interface Props {
		data: SuperValidated<Infer<FormSchema>>;
	}

	let { data }: Props = $props();
	export const title = 'Contacto';

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<div
	class="my-auto flex h-auto items-center justify-center gap-4 rounded-lg border border-slate-700/20 bg-white/50 p-4 shadow-sm md:p-8"
>
	<form method="POST" use:enhance class="mb-3 h-full w-full space-y-4">
		<Form.Field {form} name="name">
			<Form.Control >
				{#snippet children({ attrs })}
								<Form.Label>Nombre</Form.Label>
					<Input {...attrs} bind:value={$formData.name} />
											{/snippet}
						</Form.Control>
			<!-- <Form.Description>This is your public display name.</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="email">
			<Form.Control >
				{#snippet children({ attrs })}
								<Form.Label>Email</Form.Label>
					<Input {...attrs} bind:value={$formData.email} />
					<Form.FieldErrors />
											{/snippet}
						</Form.Control>
		</Form.Field>
		<Form.Field {form} name="message">
			<Form.Control >
				{#snippet children({ attrs })}
								<Form.Label>Su mensaje</Form.Label>
					<Textarea {...attrs} bind:value={$formData.message} />
					<Form.FieldErrors />
											{/snippet}
						</Form.Control>
		</Form.Field>
		<Form.Button>Enviar</Form.Button>
	</form>
</div>
