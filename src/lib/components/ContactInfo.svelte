<script lang="ts">
	import { Phone } from 'lucide-svelte';
	import FaWhatsapp from 'svelte-icons/fa/FaWhatsapp.svelte';
	type ContactInfo = {
		phone: string;
		whatsapp?: string;
		email: string;
		address: string;
		instagram?: string;
		facebook?: string;
	};

	export let data: ContactInfo;
</script>

<div class="flex h-full flex-col space-y-4 text-lg">
	<span class="flex gap-4">
		<Phone /> Teléfono: {data.phone}
	</span>
	<span class="flex gap-4">
		<div class="w-[24px]">
			<FaWhatsapp />
		</div>
		Whatsapp: {data.whatsapp}
	</span>
</div>
