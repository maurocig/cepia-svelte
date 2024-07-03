<script>
	import { team } from '$lib/team.js';
	import Title from '@/components/Title.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.title = 'Nosotros - CEPIA';
	});
</script>

<div class="mx-auto mt-8 flex h-full max-w-[1280px] flex-col gap-4 px-4 xl:px-0">
	<Title>Sobre nosotros</Title>
	<p class="max-w-[900px] text-lg text-gray-700">
		Somos un equipo de profesionales certificados en las áreas de <b>psicología</b>,
		<b>psicomotricidad</b>, <b>fonoaudiología</b> y <b>psicopedagogía</b> especializados en dificultades
		de aprendizaje.
	</p>
	<div class="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each team as { name, role, especialization }}
			<div
				class="min-h-[130px] rounded-md border-slate-900/10 bg-white/70 p-4 shadow-sm transition duration-500 hover:shadow-md"
			>
				<h2 class="text-xl font-bold">{name}</h2>
				<p class="font-semibold text-slate-700">{role}</p>
				{#if especialization}
					<p class="text-slate-600">{especialization}</p>
				{/if}
			</div>
		{/each}
	</div>
</div>
