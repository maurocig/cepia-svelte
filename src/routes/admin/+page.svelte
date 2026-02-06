<script lang="ts">
	let { data } = $props();
	let { notes } = $derived(data);
</script>

<div>
	<h1>Private Notes</h1>
	<ul>
		{#each notes as note}
			<li>{note.note}</li>
		{/each}
	</ul>
</div>
