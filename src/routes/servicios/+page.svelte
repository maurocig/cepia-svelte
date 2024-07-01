<script>
	import Card from '@/components/Card.svelte';
	import List from '@/components/List.svelte';
	import Subtitle from '@/components/Subtitle.svelte';
	import Title from '@/components/Title.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.title = 'Servicios - CEPIA';
	});
</script>

<div class="mx-auto mt-8 flex h-full max-w-[1280px] flex-col gap-8 px-4 xl:px-0">
	<Title>Servicios</Title>

	<div class="grid gap-8 lg:grid-cols-2">
		<Card
			title="Servicios de Psicología y Psiquiatría"
			showArrow={false}
			className="pointer-events-none"
		>
			<p>
				Ofrecemos terapias individuales con especialistas en psicología y psiquiatría para afrontar
				trastornos, problemas emocionales y mentales. Nuestros profesionales están comprometidos en
				proporcionar el apoyo necesario a través de tratamientos personalizados que promueven la
				salud mental y el bienestar emocional de nuestros pacientes.
			</p>
		</Card>

		<Card
			title="Programas de Desarrollo y Rehabilitación"
			showArrow={false}
			className="pointer-events-none"
		>
			<p>
				Disponemos de tratamiento especializado en psicopedagogía, psicomotricidad, fonoaudiología,
				fisioterapia y terapia ocupacional. Estos servicios están diseñados para niños, niñas y
				adolescentes que requieran apoyo en su desarrollo o rehabilitación, ya sea por dificultades
				de aprendizaje, de lenguaje o motoras, adaptando las técnicas a las necesidades individuales
				de cada paciente.
			</p>
		</Card>

		<Card
			title="Tratamientos Grupales Multidisciplinares"
			showArrow={false}
			className="pointer-events-none"
		>
			<p>
				Implementamos tratamientos grupales donde niños, niñas o adolescentes pueden beneficiarse de
				la interacción social mientras son guiados por un equipo de profesionales de diferentes
				áreas terapéuticas. Estas sesiones grupales están diseñadas para fomentar habilidades
				sociales, emocionales y cognitivas en un ambiente de integración y apoyo mutuo.
			</p>
		</Card>
		<Card title="Talleres de Expresión Creativa" showArrow={false} className="pointer-events-none">
			<p>
				Organizamos talleres que estimulan la expresión creativa mediante diversas disciplinas como
				la plástica, dramatización y narración. Estos espacios permiten a los participantes explorar
				sus emociones y pensamientos a través de la creatividad, lo cual es un complemento vital a
				los tratamientos de salud mental y apoyo educativo que proporcionamos.
			</p>
		</Card>
	</div>

	<div id="pacientes">
		<Card title="¿A quienes atendemos?" showArrow={false} className="pointer-events-none">
			<List
				items={[
					'Niños/as, adolescentes y adultos jóvenes en evaluación o atención terapéutica en las diferentes áreas.',
					'Escolares y liceales con dificultades de aprendizaje.',
					'Lactantes, niñas/os y adolescentes con dificultades de aprendizaje, trastorno, retraso o enlentecimiento en su desarrollo psico-socio-afectivo-motor.',
					'Niños/as y adolescentes en situación de discapacitad motriz, sensorial e intelectual.'
				]}
			/>
		</Card>
	</div>

	<div id="prestadores">
		<Card title="Atención y Prestadores" showArrow={false} className="pointer-events-none">
			<List
				items={[
					'Beneficiarios/as de AYEX.  Ayuda Extraordinaria que brinda el Banco de Previsión Social.',
					'Beneficiarios/as del Fondo de Tutela Social del Hospital Militar.',
					'Beneficiarios/as de Tutela Policial del Hospital Policial.'
				]}
			/>
		</Card>
	</div>
</div>
