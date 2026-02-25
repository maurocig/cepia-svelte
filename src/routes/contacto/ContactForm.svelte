<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { Infer } from 'zod/v4';
	import { formSchema, type FormSchema } from './schema';

	interface Props {
		data: SuperValidated<Infer<FormSchema>>;
	}

	let { data }: Props = $props();
	export const title = 'Contacto';

	const form = superForm(data, {
		validators: zod4Client(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<div
	class="my-auto flex h-auto items-center justify-center gap-4 rounded-lg border border-slate-700/20 bg-white/50 p-4 shadow-sm md:p-8"
>
	<form method="POST" use:enhance class="mb-3 h-full w-full space-y-4">
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props }: { props: Record<string, any> })}
					<Form.Label>Nombre</Form.Label>
					<Input {...props} bind:value={$formData.name} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props }: { props: Record<string, any> })}
					<Form.Label>Email</Form.Label>
					<Input {...props} bind:value={$formData.email} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="message">
			<Form.Control>
				{#snippet children({ props }: { props: Record<string, any> })}
					<Form.Label>Su mensaje</Form.Label>
					<Textarea {...props} bind:value={$formData.message} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button>Enviar</Form.Button>
	</form>
</div>
