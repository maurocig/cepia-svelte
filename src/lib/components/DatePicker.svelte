<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { getLocalTimeZone, parseDate, today, type CalendarDate } from '@internationalized/date';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	let {
		value = $bindable<string | undefined>(),
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
	let inputText = $state('');

	const tz = getLocalTimeZone();
	const todayDate = today(tz);

	const minValue = $derived(() => {
		if (!min) return undefined;
		if (min === 'today') return todayDate;
		if (min === 'future') return todayDate.add({ days: 1 });
		return undefined;
	});

	const maxValue = $derived(() => {
		if (!max) return undefined;
		if (max === 'today') return todayDate;
		if (max === 'past') return todayDate.subtract({ days: 1 });
		return undefined;
	});

	const fmt = new Intl.DateTimeFormat('es-UY', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});

	$effect(() => {
		const parsed = value ? parseDate(value) : undefined;
		calValue = parsed;
		inputText = parsed ? fmt.format(parsed.toDate(getLocalTimeZone())) : '';
	});

	const formatUyFromDigits = (digits: string) => {
		if (digits.length <= 2) return digits;
		if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
		return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
	};

	const isoFromUyDigits = (digits: string) => {
		if (digits.length !== 8) return null;
		const day = Number(digits.slice(0, 2));
		const month = Number(digits.slice(2, 4));
		const year = Number(digits.slice(4, 8));
		if (!day || !month || !year) return null;

		const candidate = new Date(Date.UTC(year, month - 1, day));
		const isRealDate =
			candidate.getUTCFullYear() === year &&
			candidate.getUTCMonth() === month - 1 &&
			candidate.getUTCDate() === day;
		if (!isRealDate) return null;

		return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
	};

	const passesBounds = (iso: string) => {
		const candidate = parseDate(iso);
		const minDate = minValue();
		const maxDate = maxValue();

		if (minDate && candidate.compare(minDate) < 0) return false;
		if (maxDate && candidate.compare(maxDate) > 0) return false;
		return true;
	};

	const applyTypedDate = (raw: string) => {
		const digits = raw.replace(/\D/g, '').slice(0, 8);
		inputText = formatUyFromDigits(digits);

		if (digits.length === 0) {
			value = '';
			calValue = undefined;
			return;
		}

		if (digits.length < 8) return;

		const iso = isoFromUyDigits(digits);
		if (!iso || !passesBounds(iso)) return;

		value = iso;
		calValue = parseDate(iso);
	};

	const onInputBlur = () => {
		if (!inputText.trim()) return;
		const digits = inputText.replace(/\D/g, '');
		if (digits.length === 8) {
			const iso = isoFromUyDigits(digits);
			if (iso && passesBounds(iso)) {
				inputText = fmt.format(parseDate(iso).toDate(getLocalTimeZone()));
				return;
			}
		}
		inputText = calValue ? fmt.format(calValue.toDate(getLocalTimeZone())) : '';
	};

	function onPick(v: CalendarDate | undefined) {
		calValue = v;
		value = v ? v.toString() : '';
		inputText = v ? fmt.format(v.toDate(getLocalTimeZone())) : '';
		open = false;
	}
</script>

<div class="flex flex-col gap-3">
	{#if props.name}
		<input type="hidden" name={props.name} value={value ?? ''} />
	{/if}

	<div class="relative">
		<input
			id={props.id}
			type="text"
			inputmode="numeric"
			placeholder="DD/MM/AAAA"
			class="min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 pr-10 text-sm outline-hidden ring-0 transition focus:border-slate-400"
			aria-invalid={props['aria-invalid']}
			value={inputText}
			oninput={(event) => applyTypedDate((event.currentTarget as HTMLInputElement).value)}
			onblur={onInputBlur}
		/>

		<Popover.Root bind:open>
			<Popover.Trigger>
				{#snippet child({ props: triggerProps })}
					<button
						{...triggerProps}
						type="button"
						aria-label="Abrir calendario"
						class="absolute top-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100"
					>
						<ChevronDownIcon class="size-4 shrink-0 opacity-70" />
					</button>
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
</div>
