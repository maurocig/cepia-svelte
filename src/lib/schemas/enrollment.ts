import { z } from 'zod/v4';

export const enrollmentStatusOptions = ['active', 'inactive'] as const;
export const admissionModeOptions = ['private', 'agreement'] as const;
export const agreementOrganizationOptions = [
	'BPS',
	'militarTutorship',
	'policeTutorship',
	'other'
] as const;

export const enrollmentSchema = z
	.object({
		enrollmentStatus: z.enum(enrollmentStatusOptions),
		admissionDate: z
			.string()
			.default('')
			.refine((v) => v !== '', {
				message: 'Seleccioná la fecha de inscripción'
			})
			.refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), {
				message: 'La fecha debe tener formato YYYY-MM-DD'
			}),
		admissionMode: z.preprocess(
			(v) => (v === '' ? undefined : v),
			z.enum(admissionModeOptions).optional()
		), // preprocess para convertir '' en undefined y así pasar la validación de enum cuando no se selecciona nada
		agreementOrganization: z
			.enum(agreementOrganizationOptions)
			.optional()
			.or(z.literal(''))
			.default(''),
		agreementOtherName: z.string().optional().or(z.literal('')).default(''),
		agreementExpirationDate: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.optional()
			.or(z.literal(''))
			.default('')
	})
	.refine((data) => Boolean(data.admissionMode), {
		path: ['admissionMode'],
		message: 'Indicá si el paciente es particular o tiene convenio'
	})
	.refine(
		(data) => {
			if (data.admissionMode !== 'agreement') return true;
			return Boolean(data.agreementOrganization);
		},
		{
			path: ['agreementOrganization'],
			message: 'Seleccioná un convenio'
		}
	)
	.refine(
		(data) => {
			if (data.admissionMode !== 'agreement') return true;
			return Boolean(data.agreementExpirationDate);
		},
		{
			path: ['agreementExpirationDate'],
			message: 'Ingresá la fecha de vencimiento del convenio'
		}
	)
	.refine(
		(data) => {
			if (data.agreementOrganization !== 'other') return true;
			return Boolean(data.agreementOtherName);
		},
		{
			path: ['agreementOtherName'],
			message: 'Ingresá el nombre de la institución responsable del convenio'
		}
	);

export type EnrollmentSchema = typeof enrollmentSchema;
