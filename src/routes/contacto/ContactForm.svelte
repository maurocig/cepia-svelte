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

	const { form: formData, enhance, errors, message } = form;
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
					<input type="hidden" name="name" value={$formData.name} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props }: { props: Record<string, any> })}
					<Form.Label>Email</Form.Label>
					<Input {...props} type="email" bind:value={$formData.email} />
					<input type="hidden" name="email" value={$formData.email} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="message">
			<Form.Control>
				{#snippet children({ props }: { props: Record<string, any> })}
					<Form.Label>Su mensaje</Form.Label>
					<Textarea {...props} bind:value={$formData.message} />
					<textarea hidden name="message">{$formData.message}</textarea>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		{#if $errors._errors?.length}
			<p class="text-sm text-red-600">{$errors._errors[0]}</p>
		{/if}
		{#if $message}
			<p class="text-sm text-red-600">{$message}</p>
		{/if}
		<Form.Button>Enviar</Form.Button>
	</form>
</div>
