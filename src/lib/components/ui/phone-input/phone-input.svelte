<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { phoneCountries } from '$lib/phone';
	import type { PhoneInputProps } from './types';

	let {
		class: className = undefined,
		defaultCountry = 'UY',
		country = $bindable(defaultCountry),
		placeholder = undefined,
		readonly = false,
		disabled = false,
		required = false,
		name = undefined,
		value = $bindable(''),
		...rest
	}: PhoneInputProps = $props();

	let previousCountry = $state(country);
	const currentCountry = $derived(
		phoneCountries.find((c) => c.code === country) ?? phoneCountries[0]
	);

	function onlyDigits(raw: string) {
		return raw.replace(/\D/g, '');
	}

	function formatNational(national: string, groups: number[]) {
		const out: string[] = [];
		let cursor = 0;

		for (const size of groups) {
			if (cursor >= national.length) break;
			out.push(national.slice(cursor, cursor + size));
			cursor += size;
		}

		if (cursor < national.length) out.push(national.slice(cursor));
		return out.join(' ');
	}

	function normalizeWithSpace(raw: string) {
		const digits = onlyDigits(raw);
		if (!digits) return '';

		const dial = currentCountry.dialCode;

		let national = digits;
		if (national.startsWith(dial)) {
			national = national.slice(dial.length);
		}
		return national ? `+${dial} ${formatNational(national, currentCountry.groupSizes)}` : '';
	}

	function onInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		value = normalizeWithSpace(input.value);
	}

	$effect(() => {
		if (country === previousCountry) return;
		if (value) {
			value = normalizeWithSpace(value);
		}
		previousCountry = country;
	});

	const placeholderFormatted = $derived(
		placeholder ?? normalizeWithSpace(currentCountry.example) ?? currentCountry.example
	);
</script>

<div
	class={cn(
		'border-input bg-background ring-offset-background flex h-10 w-full items-center overflow-hidden rounded-md border',
		'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
		'disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
>
	<select
		bind:value={country}
		class={cn(
			'bg-muted/30 text-foreground h-full shrink-0 border-r px-2 text-sm outline-none',
			'disabled:cursor-not-allowed disabled:opacity-50'
		)}
		{disabled}
		{required}
	>
		{#each phoneCountries as option}
			<option value={option.code}>{option.label}</option>
		{/each}
	</select>

	<input
		type="tel"
		{name}
		bind:value
		oninput={onInput}
		placeholder={placeholderFormatted}
		{readonly}
		{disabled}
		{required}
		class={cn(
			'placeholder:text-muted-foreground h-full w-full bg-transparent px-3 py-2 text-sm outline-none',
			'disabled:cursor-not-allowed disabled:opacity-50'
		)}
		{...rest}
	/>
</div>
