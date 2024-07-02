<script lang="ts">
	import { Clock, Mail, MapPin, Phone, Pin } from 'lucide-svelte';
	import FaWhatsapp from 'svelte-icons/fa/FaWhatsapp.svelte';

	type ContactInfo = {
		phone: string;
		whatsapp?: string;
		email: string;
		address: string;
		hours?: string;
		instagram?: string;
		facebook?: string;
	};

	export let data: ContactInfo;
	export let className: string = '';
</script>

<div class={`flex h-full flex-col space-y-2 ${className}`}>
	<span class="flex items-center gap-3">
		<Phone size={18} /> <b>Teléfono:</b>
		{data.phone}
	</span>
	<span class="flex items-center gap-3">
		<div class="w-[18px]">
			<FaWhatsapp />
		</div>
		<b>Whatsapp:</b>
		{data.whatsapp}
	</span>
	<span class="flex items-center gap-3">
		<Mail size={18} /> <b>Email:</b>
		{data.email}
	</span>
	<span class="flex items-center gap-3">
		<MapPin size={18} /> <b>Dirección:</b>
		{data.address}
	</span>
	{#if data.hours}
		<span class="flex items-center gap-3">
			<Clock size={18} /> <b>Horario:</b>
			{data.hours}
		</span>
	{/if}
</div>
