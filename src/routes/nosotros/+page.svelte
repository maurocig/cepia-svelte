<script>
	import { team } from '$lib/team.js';
	import Title from '@/components/Title.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.title = 'Nosotros - CEPIA';
	});
</script>

<div class="mx-auto mt-8 flex h-full max-w-[1280px] flex-col gap-8 px-4 xl:px-0">
	<Title>El equipo</Title>
	<!-- <p class="text-lg">
		En CEPIA contamos con un equipo interdisciplinario de profesionales especializados en distintas
		áreas dentro de la terapia del desarrollo y aprendizaje.
	</p> -->

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each team as { name, role, especialization }}
			<div class="p-4">
				<h2 class="font-bold">{name}</h2>
				<p class="text-slate-600">{role}</p>
				{#if especialization}
					<p class="text-slate-600">{especialization}</p>
				{/if}
			</div>
		{/each}
	</div>
</div>
