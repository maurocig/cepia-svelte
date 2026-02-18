export type PhoneCountryCode = 'UY' | 'AR' | 'BR' | 'CL' | 'US';

type PhoneCountryMeta = {
	code: PhoneCountryCode;
	name: string;
	label: string;
	dialCode: string;
	nationalMin: number;
	nationalMax: number;
	groupSizes: number[];
	example: string;
};

export const phoneCountries: PhoneCountryMeta[] = [
	{
		code: 'UY',
		name: 'Uruguay',
		label: 'UY +598',
		dialCode: '598',
		nationalMin: 8,
		nationalMax: 8,
		groupSizes: [2, 3, 3],
		example: '+59899123456'
	},
	{
		code: 'AR',
		name: 'Argentina',
		label: 'AR +54',
		dialCode: '54',
		nationalMin: 10,
		nationalMax: 10,
		groupSizes: [2, 4, 4],
		example: '+5491122334455'
	},
	{
		code: 'BR',
		name: 'Brasil',
		label: 'BR +55',
		dialCode: '55',
		nationalMin: 10,
		nationalMax: 11,
		groupSizes: [2, 5, 4],
		example: '+5511998765432'
	},
	{
		code: 'CL',
		name: 'Chile',
		label: 'CL +56',
		dialCode: '56',
		nationalMin: 9,
		nationalMax: 9,
		groupSizes: [1, 4, 4],
		example: '+56991234567'
	},
	{
		code: 'US',
		name: 'Estados Unidos',
		label: 'US +1',
		dialCode: '1',
		nationalMin: 10,
		nationalMax: 10,
		groupSizes: [3, 3, 4],
		example: '+14155552671'
	}
];

const byCode = Object.fromEntries(phoneCountries.map((c) => [c.code, c])) as Record<
	PhoneCountryCode,
	PhoneCountryMeta
>;

const byDialCode = [...phoneCountries].sort((a, b) => b.dialCode.length - a.dialCode.length);

export function normalizePhoneByCountry(raw: string, country: PhoneCountryCode): string {
	const meta = byCode[country];
	const digits = raw.replace(/\D/g, '');
	if (!digits) return '';

	let national = digits;
	if (national.startsWith(meta.dialCode)) {
		national = national.slice(meta.dialCode.length);
	}

	return `+${meta.dialCode}${national}`;
}

export function isValidPhoneForCountry(value: string, country: PhoneCountryCode): boolean {
	const meta = byCode[country];
	const digits = value.replace(/\D/g, '');
	if (!digits.startsWith(meta.dialCode)) return false;

	const nationalLen = digits.length - meta.dialCode.length;
	return nationalLen >= meta.nationalMin && nationalLen <= meta.nationalMax;
}

export function isValidSupportedInternationalPhone(value: string): boolean {
	const digits = value.replace(/\D/g, '');
	if (!digits) return false;

	const meta = byDialCode.find((c) => digits.startsWith(c.dialCode));
	if (!meta) return false;

	const nationalLen = digits.length - meta.dialCode.length;
	return nationalLen >= meta.nationalMin && nationalLen <= meta.nationalMax;
}

export function getSupportedPhoneCountryName(value: string): string | null {
	const digits = value.replace(/\D/g, '');
	if (!digits) return null;

	const meta = byDialCode.find((c) => digits.startsWith(c.dialCode));
	return meta?.name ?? null;
}

export function getInvalidSupportedPhoneMessage(value: string): string {
	const countryName = getSupportedPhoneCountryName(value);
	if (!countryName) return 'Formato inválido para el país seleccionado';
	return `Formato inválido para ${countryName}`;
}

export const supportedPhoneExamples = phoneCountries.map((c) => c.example).join(', ');
