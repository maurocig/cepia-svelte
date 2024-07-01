<script lang="ts">
	import BannerHome from '@/components/BannerHome.svelte';
	import Card from '@/components/Card.svelte';
	import LogoHome from '@/components/LogoHome.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.title = 'Inicio - CEPIA';
	});
</script>

<BannerHome />

<div class="mx-auto mt-8 flex h-full max-w-[1280px] flex-col gap-8 px-4 lg:px-0">
	<LogoHome />

	<p class="mx-auto mb-8 max-w-[600px] text-center text-lg">
		Somos una institución dedicada a brindar atención integral a niños y adolescentes con
		dificultades en su desarrollo. Desde 1998, hemos sido impulsados por un grupo de profesionales
		comprometidos con la salud y la educación, brindando un apoyo integral e interdisciplinario.
	</p>

	<section class="mx-auto grid max-w-[1000px] gap-4 md:grid-cols-2">
		<Card title="Servicios" href="/servicios">
			<div>
				Brindamos <b>orientación</b>, <b>diagnóstico</b> y <b>tratamiento</b> dirigido a lactantes, niños,
				adolescentes y jóvenes adultos, acompañando y orientando al núcleo familiar en el proceso.
			</div>
		</Card>
		<Card title="Nuestro equipo" href="/nosotros"
			>Somos un equipo de profesionales certificados en las áreas de <b>psicología</b>,
			<b>psicomotricidad</b>, <b>fonoaudiología</b> y <b>psicopedagogía</b>, especializados en
			dificultades de aprendizaje.
		</Card>
		<Card title="Nuestros pacientes" href="/servicios#pacientes">
			<!-- <Card title="Alcance" href=""> -->
			<ul>
				Atendemos a escolares y liceales con dificultades de aprendizaje, así como a niños y
				adolescentes en situación de discapacidad motriz, sensorial o intelectual.
			</ul>
		</Card>
		<Card title="Prestadores" href="/servicios#prestadores">
			Nuestros servicios están disponibles para pacientes particulares, al igual que beneficiarios
			de hospitales, fondos de salud y el Banco de Previsión Social.
		</Card>
	</section>

	<section></section>
</div>
