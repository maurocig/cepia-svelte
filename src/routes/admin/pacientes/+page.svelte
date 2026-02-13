<script>
	import { navigating } from '$app/stores';
	import LoadingButton from '@/components/LoadingButton.svelte';
	import Button from '@/components/ui/button/button.svelte';
</script>

<h1 class="mb-4 text-xl">Pacientes</h1>

<!-- <Button
	><a href="/admin/pacientes/nuevo" data-sveltekit-preload-data="hover">Nuevo paciente</a></Button
> -->

<LoadingButton href="/admin/pacientes/nuevo" preloadData="hover" loading={$navigating}
	>Nuevo paciente</LoadingButton
>
