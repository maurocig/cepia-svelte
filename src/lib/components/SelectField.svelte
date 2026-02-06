<script lang="ts">
	import * as SelectUI from '$lib/components/ui/select/index.js';

	// Generic option type
	export type Option = {
		value: string;
		label: string;
	};

	// Props coming from Form.Control + parent
	// - options: array of selectable values
	// - value: bindable selected value
	// - props: id, name, aria-* from formsnap
	let {
		options,
		value = $bindable(''),
		...props
	} = $props<
		{
			options: Option[];
			value?: string;
		} & Record<string, any>
	>();

	const triggerContent = $derived(
		options.find((o: Option) => o.value === value)?.label ?? 'Seleccionar'
	);
</script>

<div class="flex flex-col gap-2">
	<SelectUI.Root type="single" bind:value>
		<SelectUI.Trigger
			id={props.id}
			class="h-10 w-full justify-between"
			aria-invalid={props['aria-invalid']}
		>
			{triggerContent}
		</SelectUI.Trigger>

		<SelectUI.Content>
			{#each options as option (option.value)}
				<SelectUI.Item value={option.value} label={option.label}>
					{option.label}
				</SelectUI.Item>
			{/each}
		</SelectUI.Content>
	</SelectUI.Root>

	{#if props.name}
		<input type="hidden" name={props.name} {value} />
	{/if}
</div>
