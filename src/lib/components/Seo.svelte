<script lang="ts">
	import { page } from '$app/stores';

	export let title: string;
	export let description: string =
		'El Centro Psicopedagógico Integral de Atlántida es una institución dedicada a brindar atención integral a niños y adolescentes con dificultades en su desarrollo.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta
		name="keywords"
		content="psicopedagogía, psicología, psicomotricidad, fisioterapia, fonoaudiología, dificultades de aprendizaje, desarrollo, niños, adolescentes, jóvenes adultos, familia, interdisciplinario, salud, educación, Atlántida, Canelones, Uruguay, Las Toscas, Costa de Oro, CEPIA, centro psicopedagogico, psicologia, psicopedagogia, fonoaudiologia, jovenes, aprendizaje, retraso, discapacidad, discapacidades, niñez"
	/>
	<meta name="google-site-verification" content="YqovsgY-C2nBCs9YOdpteZVHFCVsLft63T58CThlcWg" />
</svelte:head>
