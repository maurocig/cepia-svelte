<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { loginSchema, type LoginSchema } from './schema';

	import { Input } from '$lib/components/ui/input/index.js';
	import LogoHome from '@/components/LogoHome.svelte';
	import type { Infer } from 'zod/v4';

	let { data }: { data: { form: SuperValidated<Infer<LoginSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(loginSchema)
	});

	const { form: formData, enhance, message, submitting } = form;
</script>

<div class="mx-auto mt-10 w-full max-w-md">
	<div class="rounded-xl border bg-white p-6 shadow-sm">
		<!-- Logo -->
		<div class="mb-6 flex w-full justify-center">
			<div class="w-[120px]">
				<img
					src="/icons/logo-ana.svg"
					alt="logo"
					class="h-full w-full object-contain object-left drop-shadow-md"
				/>
			</div>
		</div>
		<div class="mb-6 text-center">
			<h1 class="text-2xl font-semibold">Login</h1>
			<p class="mt-1 text-sm opacity-70">Entrar a cepia admin</p>
		</div>

		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props }: { props: Record<string, any> })}
						<Form.Label>Email</Form.Label>
						<Input {...props} bind:value={$formData.email} type="email" />
						<input type="hidden" name="email" value={$formData.email} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props }: { props: Record<string, any> })}
						<Form.Label>Contraseña</Form.Label>
						<Input {...props} bind:value={$formData.password} type="password" />
						<input type="hidden" name="password" value={$formData.password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			{#if $message}
				<p class="text-sm text-red-600">{$message}</p>
			{/if}

			<Form.Button type="submit" class="mt-4 h-11 w-full cursor-pointer" disabled={$submitting}>
				{#if $submitting}
					<span
						class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					/>
					Iniciando...
				{:else}
					Iniciar sesión
				{/if}
			</Form.Button>
		</form>
	</div>
</div>
