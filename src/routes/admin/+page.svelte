<script lang="ts">
	import Button from '@/components/ui/button/button.svelte';
	import Input from '@/components/ui/input/input.svelte';
	const { data } = $props();
</script>

<div>
	<h1>Dashboard de <strong>{data.user.email}</strong></h1>
</div>

<Button href="/admin/pacientes/nuevo">Agregar nuevo paciente</Button>
