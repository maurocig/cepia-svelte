<script lang="ts">
	import ContactInfo from '@/components/ContactInfo.svelte';
	import GoogleMap from '@/components/GoogleMap.svelte';
	import Seo from '@/components/Seo.svelte';
	import ContactForm from './ContactForm.svelte';

	export let data;

	let width: number;
</script>

<div
	class="mx-auto mt-8 flex h-full min-h-[calc(100vh-100px)] max-w-[1280px] flex-col gap-8 px-4 xl:px-0"
>
	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		<div class="space-y-4">
			<h1 class="text-2xl font-semibold">Dejanos tu consulta</h1>
			<ContactForm data={data.contactForm} />
		</div>
		<div class="space-y-4" bind:clientWidth={width}>
			<h1 class="text-2xl font-semibold">Mapa</h1>
			<GoogleMap {width} />
		</div>
		<div class="space-y-4">
			<h1 class="text-2xl font-semibold">Información de contacto</h1>
			<ContactInfo
				className="ml-4"
				data={{
					phone: '437 22794',
					whatsapp: '098 400 860',
					address: 'Calle 22 y 15, Atlántida, Canelones',
					email: 'centrocepia@gmail.com',
					hours: 'Lunes a viernes de 9 a 18hs'
				}}
			/>
		</div>
	</div>
	<!-- <div class="space-y-4" bind:offsetWidth={width}></div> -->
</div>

<Seo title="Contacto | CEPIA" description="Dejanos tu consulta" />
