<script>
	import Subtitle from '@/components/Subtitle.svelte';
	import Title from '@/components/Title.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.title = 'Servicios - CEPIA';
	});
</script>

<div class="mx-auto mt-8 flex h-full max-w-[1280px] flex-col gap-8 px-4 xl:px-0">
	<Title>Servicios</Title>

	<div class="flex flex-col gap-8 px-4">
		<div class="">
			<Subtitle>Servicios de Psicología y Psiquiatría</Subtitle>
			<p>
				Ofrecemos terapias individuales con especialistas en psicología y psiquiatría para afrontar
				trastornos, problemas emocionales y mentales. Nuestros profesionales están comprometidos en
				proporcionar el apoyo necesario a través de tratamientos personalizados que promueven la
				salud mental y el bienestar emocional de nuestros pacientes.
			</p>
		</div>

		<div>
			<Subtitle>Programas de Desarrollo y Rehabilitación</Subtitle>
			<p>
				Disponemos de tratamiento especializado en psicopedagogía, psicomotricidad, fonoaudiología,
				fisioterapia y terapia ocupacional. Estos servicios están diseñados para niños, niñas y
				adolescentes que requieran apoyo en su desarrollo o rehabilitación, ya sea por dificultades
				de aprendizaje, de lenguaje o motoras, adaptando las técnicas a las necesidades individuales
				de cada paciente.
			</p>
		</div>

		<div>
			<Subtitle>Tratamientos Grupales Multidisciplinares</Subtitle>
			<p>
				Implementamos tratamientos grupales donde niños, niñas o adolescentes pueden beneficiarse de
				la interacción social mientras son guiados por un equipo de profesionales de diferentes
				áreas terapéuticas. Estas sesiones grupales están diseñadas para fomentar habilidades
				sociales, emocionales y cognitivas en un ambiente de integración y apoyo mutuo.
			</p>
		</div>

		<div>
			<Subtitle>Talleres de Expresión Creativa</Subtitle>
			<p>
				Organizamos talleres que estimulan la expresión creativa mediante diversas disciplinas como
				la plástica, dramatización y narración. Estos espacios permiten a los participantes explorar
				sus emociones y pensamientos a través de la creatividad, lo cual es un complemento vital a
				los tratamientos de salud mental y apoyo educativo que proporcionamos.
			</p>
		</div>
	</div>
</div>
