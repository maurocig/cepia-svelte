<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';

	console.log('page load');
	let error = $state('');

	async function signup(e: Event) {
		e.preventDefault();

		const form = e.target as HTMLFormElement;
		const username = (form.querySelector('#username') as HTMLInputElement).value;
		const email = (form.querySelector('#email') as HTMLInputElement).value;
		const password = (form.querySelector('#password') as HTMLInputElement).value;
		const confirmPassword = (form.querySelector('#confirm-password') as HTMLInputElement).value;

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (!username || !email || !password || !confirmPassword) {
			error = 'All fields are required';
			return;
		}

		await authClient.signUp.email(
			{ email, password, name: username },
			{
				onSuccess: async () => {
					// what you want to do on success
					goto(resolve('/'));
				}
			}
		);
	}
</script>

<h1 class="mx-auto mb-3 w-full text-center text-2xl">Sign Up</h1>
<form
	class="mx-auto flex max-w-[400px] flex-col gap-3 rounded-md bg-slate-200 p-4"
	onsubmit={signup}
>
	<div class="flex flex-col gap-2">
		<label for="username"> Username </label>
		<input
			required
			type="text"
			id="username"
			class="rounded-md bg-slate-300 px-2 py-1 text-black"
		/>
	</div>
	<div class="flex flex-col gap-2">
		<label for="email"> Email </label>
		<input required type="email" id="email" class="rounded-md bg-slate-300 px-2 py-1 text-black" />
	</div>
	<div class="flex flex-col gap-2">
		<label for="password"> Password </label>
		<input
			required
			type="password"
			id="password"
			class="rounded-md bg-slate-300 px-2 py-1 text-black"
		/>
	</div>
	<div class="flex flex-col gap-2">
		<label for="confirm-password"> Confirm Password </label>
		<input
			required
			type="password"
			id="confirm-password"
			class="rounded-md bg-slate-300 px-2 py-1 text-black"
		/>
	</div>

	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}

	<button type="submit" class="mt-4 rounded-lg bg-slate-800 px-6 py-2 text-white">Sign Up</button>
</form>
