<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { LogOutIcon } from 'lucide-svelte';

	let loading = $state(false);

	async function logout() {
		if (loading) return;

		loading = true;
		try {
			await authClient.signOut();
			await goto('/auth/login');
		} finally {
			loading = false;
		}
	}
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger
		class={buttonVariants({ variant: 'ghost' }) +
			'mt-4 w-full justify-start border border-transparent font-normal text-gray-500 hover:cursor-pointer hover:border-slate-300'}
		disabled={loading}
	>
		<LogOutIcon size="22" class="mr-2" />
		Cerrar sesión
	</AlertDialog.Trigger>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>¿Cerrar sesión?</AlertDialog.Title>
			<AlertDialog.Description>
				Se cerrará tu sesión en este dispositivo. Vas a tener que volver a iniciar sesión para
				entrar al panel.
			</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={loading} class="cursor-pointer">Cancelar</AlertDialog.Cancel>

			<AlertDialog.Action
				disabled={loading}
				onclick={logout}
				class="flex cursor-pointer items-center gap-2"
			>
				{#if loading}
					<span
						class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					/>
					Cerrando...
				{:else}
					Cerrar sesión
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
