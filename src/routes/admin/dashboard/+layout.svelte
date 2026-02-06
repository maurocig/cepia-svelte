<script lang="ts">
	const { children } = $props();
</script>

<div class="min-h-full w-full">
	{@render children?.()}
</div>
