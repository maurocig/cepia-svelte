<script lang="ts">
	import Button from './ui/button/button.svelte';

	interface ComponentProps {
		isRegistration: boolean;
	}

	let { isRegistration } = $props();
</script>

<div class="w-[500px] rounded-lg border-slate-600 bg-white p-6">
	<h1 class="mb-4 text-2xl">
		{isRegistration ? 'Register' : 'Login'}
	</h1>

	<form
		class="flex flex-col gap-4"
		action={isRegistration ? '?/register' : '?/login'}
		method="POST"
	>
		<input
			type="email"
			name="email"
			class="rounded-lg bg-slate-200 p-3"
			placeholder="Email"
			required
		/>
		<input
			name="password"
			type="password"
			class="rounded-lg bg-slate-200 p-3"
			placeholder="Contraseña"
			required
		/>
		{#if isRegistration}
			<input
				name="passwordConfirmation"
				type="password"
				placeholder="Confirmar Contraseña"
				class="rounded-lg bg-slate-200 p-3"
				required
			/>
			<input
				type="text"
				name="name"
				class="rounded-lg bg-slate-200 p-3"
				placeholder="Nombre"
				required
			/>
		{/if}
		<button class="rounded-lg bg-gray-800 p-2 text-slate-100"
			>{isRegistration ? 'Register' : 'Login'}</button
		>
	</form>
</div>
