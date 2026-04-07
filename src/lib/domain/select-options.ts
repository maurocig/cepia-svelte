export const idTypeValues = ['CI', 'DNI', 'PAS'] as const;
export const enrollmentStatusValues = ['active', 'inactive'] as const;
export const admissionModeValues = ['private', 'agreement'] as const;
export const agreementOrganizationValues = [
	'BPS',
	'militarTutorship',
	'policeTutorship',
	'other'
] as const;
export const treatmentDayValues = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
export const schoolTypeValues = ['kindergarten', 'primary', 'secondary'] as const;
export const schoolShiftValues = ['morning', 'afternoon', 'night'] as const;

export const idTypeOptions = [
	{ value: 'CI', label: 'CI' },
	{ value: 'DNI', label: 'DNI' },
	{ value: 'PAS', label: 'Pasaporte' }
] as const;

export const enrollmentStatusOptions = [
	{ value: 'active', label: 'Activo' },
	{ value: 'inactive', label: 'Inactivo' }
] as const;

export const admissionModeOptions = [
	{ value: 'private', label: 'Particular' },
	{ value: 'agreement', label: 'Convenio' }
] as const;

export const agreementOrganizationOptions = [
	{ value: 'BPS', label: 'Banco de Previsión Social' },
	{ value: 'militarTutorship', label: 'Tutela militar' },
	{ value: 'policeTutorship', label: 'Tutela policial' },
	{ value: 'other', label: 'Otro' }
] as const;

export const treatmentDayOptions = [
	{ value: 'monday', label: 'Lunes' },
	{ value: 'tuesday', label: 'Martes' },
	{ value: 'wednesday', label: 'Miércoles' },
	{ value: 'thursday', label: 'Jueves' },
	{ value: 'friday', label: 'Viernes' }
] as const;

export const treatmentHourOptions = Array.from({ length: 11 }, (_, index) => {
	const value = String(index + 8).padStart(2, '0');
	return { value, label: value };
});

export const treatmentMinuteOptions = Array.from({ length: 12 }, (_, index) => {
	const value = String(index * 5).padStart(2, '0');
	return { value, label: value };
});

export const schoolTypeOptions = [
	{ value: 'kindergarten', label: 'Preescolar' },
	{ value: 'primary', label: 'Escolar' },
	{ value: 'secondary', label: 'Liceal' }
] as const;

export const schoolShiftOptions = [
	{ value: 'morning', label: 'Mañana' },
	{ value: 'afternoon', label: 'Tarde' },
	{ value: 'night', label: 'Noche' }
] as const;

export function getOptionLabel<T extends string>(
	options: readonly { value: T; label: string }[],
	value: string | null | undefined,
	fallback = '-'
) {
	if (!value) return fallback;
	return options.find((o) => o.value === value)?.label ?? value;
}
