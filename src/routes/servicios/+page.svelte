<script>
	import BgImageCard from '@/components/BgImageCard.svelte';
	import Card from '@/components/Card.svelte';
	import List from '@/components/List.svelte';
	import Subtitle from '@/components/Subtitle.svelte';
	import Title from '@/components/Title.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.title = 'Servicios - CEPIA';
	});
</script>

<div class="mx-auto mt-8 flex h-full max-w-[1280px] flex-col gap-4 px-4 xl:gap-8 xl:px-0">
	<Title>Servicios</Title>

	<div class="grid auto-rows-fr gap-4 lg:grid-cols-2 xl:gap-8">
		<BgImageCard
			title="Servicios de Psicología y Psiquiatría"
			description="Ofrecemos terapias individuales con especialistas en psicología y psiquiatría para afrontar trastornos, problemas emocionales y mentales. Nuestros profesionales están comprometidos en proporcionar el apoyo necesario a través de tratamientos personalizados que promueven la salud mental y el bienestar emocional de nuestros pacientes."
			image="/img/chenga-colores.jpg"
		/>
		<BgImageCard
			title="Programas de Desarrollo y Rehabilitación"
			description="Disponemos de tratamiento especializado en psicopedagogía, psicomotricidad, fonoaudiología,
				fisioterapia y terapia ocupacional. Estos servicios están diseñados para niños, niñas y
				adolescentes que requieran apoyo en su desarrollo o rehabilitación, ya sea por dificultades
				de aprendizaje, de lenguaje o motoras, adaptando las técnicas a las necesidades individuales
				de cada paciente."
			image="/img/mano-pintada.jpg"
		/>
		<BgImageCard
			title="Tratamientos Grupales Multidisciplinares"
			showArrow={false}
			description="Implementamos tratamientos grupales donde niños, niñas o adolescentes pueden beneficiarse de
				la interacción social mientras son guiados por un equipo de profesionales de diferentes
				áreas terapéuticas. Estas sesiones grupales están diseñadas para fomentar habilidades
				sociales, emocionales y cognitivas en un ambiente de integración y apoyo mutuo."
			image="/img/mascaras-barro.jpg"
		/>
		<BgImageCard
			title="Talleres de Expresión Creativa"
			image="/img/pintando-diarios.jpg"
			showArrow={false}
			description=" Organizamos talleres que estimulan la expresión creativa mediante diversas disciplinas como la plástica, dramatización y narración. Estos espacios permiten a los participantes explorar sus emociones y pensamientos a través de la creatividad, lo cual es un complemento vital a los tratamientos de salud mental y apoyo educativo que proporcionamos."
		/>
	</div>

	<div id="pacientes" class="mt-[-70px] pb-[55px] xl:pb-[40px]"></div>
	<div id="">
		<Card title="¿A quienes atendemos?" showArrow={false}>
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

	<div id="prestadores" class="mt-[-70px] pb-[55px] xl:pb-[40px]"></div>
	<div id="">
		<Card title="Atención y prestadores" showArrow={false}>
			<List
				items={[
					'Beneficiarios/as de AYEX.  Ayuda Extraordinaria que brinda el Banco de Previsión Social.',
					'Beneficiarios/as del Fondo de Tutela Social del Hospital Militar.',
					'Beneficiarios/as de Tutela Policial del Hospital Policial.',
					'Pacientes particulares.'
				]}
			/>
		</Card>
	</div>

	<div id="areas-abordaje" class="mt-[-70px] pb-[55px] xl:pb-[40px]"></div>
	<div class="grid w-full gap-4 md:grid-cols-2 xl:gap-8">
		<div>
			<Card title="Áreas de abordaje" showArrow={false}>
				<List
					dot={true}
					items={[
						'Psicología',
						'Psiquiatría',
						'Psicopedagogía',
						'Psicomotricidad',
						'Fonoaudiología',
						'Fisioterapia',
						'Terapia Ocupacional',
						'Apoyo Escolar y Liceal',
						'Tratamientos de Áreas Integradas para niños, niñas y adolescentes.'
					]}
				/>
			</Card>
		</div>

		<div id="abordajes">
			<Card title="Abordajes terapéuticos" showArrow={false}>
				<List
					dot={true}
					items={[
						'Tratamientos individuales en las áreas de atención demandadas.',
						'Dispositivos grupales en las áreas Psicopedagógica, Psicológica y Psicomotriz',
						'Tratamientos grupales de Áreas Integradas: grupos de niños, niñas adolescentes, con la participación de dos profesionales de las distintas áreas de intervención.',
						'Talleres de expresión creativa en plástica, dramatización, narración, etc.'
					]}
				/>
			</Card>
		</div>
	</div>
</div>
