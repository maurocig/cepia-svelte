import type { PhoneCountryCode } from '$lib/phone';

export type PhoneInputProps = {
	country?: PhoneCountryCode;
	defaultCountry?: PhoneCountryCode;
	name?: string;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;
	class?: string;
	value?: string;
};
