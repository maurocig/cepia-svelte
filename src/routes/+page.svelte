<script lang="ts">
	import BannerHome from '@/components/BannerHome.svelte';
	import Card from '@/components/Card.svelte';
	import LogoHome from '@/components/LogoHome.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.title = 'Inicio - CEPIA';
	});
</script>

<div class="relative">
	<BannerHome />
</div>

<div class="mx-auto mt-8 flex h-full max-w-[1280px] flex-col gap-8 px-4 lg:px-0">
	<LogoHome />

	<p class="mx-auto mb-8 max-w-[600px] text-center text-lg">
		Somos una institución dedicada a brindar atención integral a niños y adolescentes con
		dificultades en su desarrollo. Desde 1998, hemos sido impulsados por un grupo de profesionales
		comprometidos con la salud y la educación, brindando un apoyo integral e interdisciplinario.
	</p>

	<section class="mx-auto grid max-w-[1000px] auto-rows-fr gap-4 md:grid-cols-2">
		<a href="/servicios">
			<Card title="Servicios">
				<div>
					Brindamos <b>orientación</b>, <b>diagnóstico</b> y <b>tratamiento</b> dirigido a lactantes,
					niños, adolescentes y jóvenes adultos, acompañando y orientando al núcleo familiar en el proceso.
				</div>
			</Card>
		</a>
		<a href="/nosotros">
			<Card title="Nuestro equipo">
				Somos un equipo de profesionales en las áreas de <b>Psicología</b>,
				<b>Psicomotricidad</b>, <b>Fisioterapia</b>, <b>Fonoaudiología</b> y <b>Psicopedagogía</b> especializados
				en dificultades de aprendizaje.
			</Card>
		</a>
		<a href="/servicios#pacientes">
			<Card title="Nuestros pacientes">
				<ul>
					Atendemos a escolares y liceales con dificultades de aprendizaje, así como a niños y
					adolescentes en situación de discapacidad motriz, sensorial o intelectual.
				</ul>
			</Card>
		</a>
		<a href="/servicios#prestadores">
			<Card title="Atención y prestadores">
				Nuestros servicios están disponibles para pacientes particulares, beneficiarios de AYEX
				(Banco de Previsión Social) y otros convenios.
			</Card>
		</a>
	</section>

	<section></section>
</div>
