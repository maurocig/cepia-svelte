<script lang="ts">
	import ContactInfo from '@/components/ContactInfo.svelte';
	import GoogleMap from '@/components/GoogleMap.svelte';
	import { onMount } from 'svelte';
	import ContactForm from './ContactForm.svelte';

	export let data;

	let width: number;

	onMount(() => {
		document.title = 'Contacto - CEPIA';
	});
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
				data={{
					phone: '092837',
					whatsapp: '23987',
					address: 'Calle 22 y 15, Atlántida, Canelones',
					email: 'ejemplo@gmail.com'
				}}
			/>
		</div>
	</div>
	<!-- <div class="space-y-4" bind:offsetWidth={width}></div> -->
</div>
