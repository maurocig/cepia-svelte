<script>
	import { team } from '$lib/team.js';
	import Title from '@/components/Title.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.title = 'Nosotros - CEPIA';
	});
</script>

<div class="mx-auto mt-8 flex h-full max-w-[1280px] flex-col px-4 xl:px-0">
	<Title>Nuestro equipo</Title>
	<!-- <p class="max-w-[900px] text-lg text-gray-700">
		Somos un equipo de profesionales certificados en las áreas de <b>psicología</b>,
		<b>psicomotricidad</b>, <b>fonoaudiología</b>, <b>psicopedagogía</b> especializados en dificultades
		de aprendizaje.
	</p> -->
	<div class="mt-4 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each team as { name, role, especialization, image }}
			<div class="grid">
				<!-- <div
					class="object z-40 mx-auto mb-[-20px] aspect-square w-[70px] overflow-hidden rounded-full border-2 border-green-600/90 shadow-md"
				> -->
				<div
					class="z-20 flex gap-4 rounded-md border-slate-900/10 bg-white/70 p-4 shadow-sm transition duration-500 hover:shadow-md md:min-h-[140px]"
				>
					<div
						class="z-40 aspect-square h-fit w-[20%] overflow-hidden rounded-full border-[3px] border-green-600/90 shadow-md"
					>
						<img
							src="img/profile/{image || 'default2.jpg'}"
							alt="Imagen de {name}"
							class="h-full w-full object-cover object-center"
						/>
					</div>
					<div class="w-[80%]">
						<h2 class="text-xl font-bold">{name}</h2>
						<p class="font-semibold text-slate-700">{role}</p>
						{#if especialization}
							<p class="text-slate-600">{especialization}</p>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
