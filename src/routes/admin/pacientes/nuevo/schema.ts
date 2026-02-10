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
		admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		admissionMode: z.enum(admissionModeOptions),
		agreementOrganization: z
			.enum(agreementOrganizationOptions)
			.optional()
			.or(z.literal(''))
			.default(''),
		agreementOtherName: z.string().optional().or(z.literal('')).default('')
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
			if (data.agreementOrganization !== 'other') return true;
			return Boolean(data.agreementOtherName);
		},
		{
			path: ['agreementOtherName'],
			message: 'Ingresá el nombre de la institución responsable del convenio'
		}
	);

export type EnrollmentSchema = typeof enrollmentSchema;
