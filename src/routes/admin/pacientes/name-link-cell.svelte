<script lang="ts">
	import { formatPersonName } from '$lib/utils';
	let { href, name }: { href: string; name: string } = $props();
</script>

<a {href} class="text-primary hover:underline">{formatPersonName(name)}</a>
