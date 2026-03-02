<script lang="ts">
	import Button from '@/components/ui/button/button.svelte';
	import Input from '@/components/ui/input/input.svelte';
	const { data } = $props();
</script>

<div class="mb-6">
	Bienvenido, <strong>{data.user?.email ?? 'usuario'}</strong>
</div>

<Button href="/admin/pacientes/nuevo">Agregar nuevo paciente</Button>
