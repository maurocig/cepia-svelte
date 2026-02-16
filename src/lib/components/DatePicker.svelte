<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { getLocalTimeZone, parseDate, today, type CalendarDate } from '@internationalized/date';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	// Designed to work with shadcn-svelte + formsnap/superforms.
	// `value` is an ISO date string: YYYY-MM-DD
	// `id`/`name`/aria attributes are provided via `{...props}` from `<Form.Control>`.
	let {
		value = $bindable(''),
		min,
		max,
		...props
	}: {
		value?: string;
		min?: 'past' | 'today' | 'future';
		max?: 'past' | 'today' | 'future';
		[key: string]: any;
	} = $props();

	let open = $state(false);
	let calValue = $state<CalendarDate | undefined>();

	// Keep internal CalendarDate in sync when the bound ISO value changes.
	$effect(() => {
		calValue = value ? parseDate(value) : undefined;
	});

	const tz = getLocalTimeZone();
	const todayDate = today(tz);

	const minValue = $derived(() => {
		if (!min) return undefined;
		if (min === 'today') return todayDate;
		if (min === 'future') return todayDate.add({ days: 1 });
		if (min === 'past') return undefined;
		return undefined;
	});

	const maxValue = $derived(() => {
		if (!max) return undefined;
		if (max === 'today') return todayDate;
		if (max === 'past') return todayDate.subtract({ days: 1 });
		if (max === 'future') return undefined;
		return undefined;
	});

	const fmt = new Intl.DateTimeFormat('es-UY', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});

	const display = $derived(() => {
		if (!calValue) return 'Seleccionar fecha';
		return fmt.format(calValue.toDate(getLocalTimeZone()));
	});

	function onPick(v: CalendarDate | undefined) {
		calValue = v;
		value = v ? v.toString() : '';
		open = false;
	}
</script>

<div class="flex flex-col gap-3">
	{#if props.name}
		<input type="hidden" name={props.name} {value} />
	{/if}
	<Popover.Root bind:open>
		<Popover.Trigger id={props.id}>
			{#snippet child({ props: triggerProps })}
				<Button
					{...triggerProps}
					variant="outline"
					class="h-9 w-full justify-between font-normal hover:bg-slate-50/10"
					aria-invalid={triggerProps['aria-invalid']}
				>
					{display()}
					<ChevronDownIcon class="ml-2 size-4 shrink-0 opacity-60" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-auto overflow-hidden p-0" align="start">
			<Calendar
				type="single"
				value={calValue}
				onValueChange={onPick}
				captionLayout="dropdown"
				locale="es-UY"
				minValue={minValue()}
				maxValue={maxValue()}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
