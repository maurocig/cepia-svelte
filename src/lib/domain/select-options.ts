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
export const treatmentTimeValues = [
	'09:00',
	'10:00',
	'11:00',
	'12:00',
	'13:00',
	'14:00',
	'15:00',
	'16:00',
	'17:00',
	'18:00'
] as const;
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

export const treatmentTimeOptions = [
	{ value: '09:00', label: '09:00' },
	{ value: '10:00', label: '10:00' },
	{ value: '11:00', label: '11:00' },
	{ value: '12:00', label: '12:00' },
	{ value: '13:00', label: '13:00' },
	{ value: '14:00', label: '14:00' },
	{ value: '15:00', label: '15:00' },
	{ value: '16:00', label: '16:00' },
	{ value: '17:00', label: '17:00' },
	{ value: '18:00', label: '18:00' }
] as const;

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
