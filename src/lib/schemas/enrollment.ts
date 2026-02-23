import { z } from 'zod/v4';
import { getInvalidSupportedPhoneMessage, isValidSupportedInternationalPhone } from '$lib/phone';
import {
	admissionModeValues,
	agreementOrganizationValues,
	enrollmentStatusValues,
	idTypeValues
} from '$lib/domain/select-options';
import { todayYyyyMmDd } from '$lib/utils';

const nonEmpty = (msg: string) => z.string().trim().min(1, msg);

// checkbox hidden inputs can come as "true"/"false" or "on"
const checkboxBool = z.preprocess((v) => {
	if (typeof v === 'boolean') return v;
	if (typeof v !== 'string') return false;
	const s = v.toLowerCase();
	return s === 'true' || s === 'on' || s === '1';
}, z.boolean());

export const idTypeOptions = idTypeValues;
export const enrollmentStatusOptions = enrollmentStatusValues;
export const admissionModeOptions = admissionModeValues;
export const agreementOrganizationOptions = agreementOrganizationValues;

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
			.default(''),

		// titular (persona que viene a inscribir)
		holderFirstName: nonEmpty('Ingresá el nombre del titular'),
		holderLastName: nonEmpty('Ingresá el apellido del titular'),
		holderIdType: z.enum(idTypeOptions).optional().or(z.literal('')).default('CI'),
		holderIdNumber: nonEmpty('Ingresá el número de documento del titular'),
		holderPhone: z.string().trim().min(1, 'Ingresá el teléfono del titular'),

		// tratamientos (checklist)
		psychology: checkboxBool.default(false),
		psychomotricity: checkboxBool.default(false),
		speechTherapy: checkboxBool.default(false),
		psychopedagogy: checkboxBool.default(false),
		pedagogicalSupport: checkboxBool.default(false),
		physiotherapy: checkboxBool.default(false),
		occupationalTherapy: checkboxBool.default(false),
		workshops: checkboxBool.default(false),
		treatmentsNotes: z.string().optional().or(z.literal('')).default('')
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
			if (data.agreementOrganization !== 'BPS') return true;
			return Boolean(data.agreementExpirationDate);
		},
		{
			path: ['agreementExpirationDate'],
			message: 'Ingresá la fecha de vencimiento del convenio BPS'
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
	)
	.refine((data) => Boolean(data.holderIdType), {
		path: ['holderIdType'],
		message: 'Seleccioná el tipo de documento del titular'
	})
	.refine(
		(data) => {
			const doc = data.holderIdNumber.trim();
			if (!doc) return true;

			if (data.holderIdType === 'PAS') return /^[A-Za-z0-9]+$/.test(data.holderIdNumber.trim());
			return /^\d+$/.test(data.holderIdNumber.trim());
		},
		{
			path: ['holderIdNumber'],
			message: 'Documento invalido para el tipo seleccionado'
		}
	)
	.refine(
		(data) => {
			const doc = data.holderIdNumber.trim();
			if (!doc) return true;

			if (data.holderIdType !== 'CI') return true;
			return /^\d{8}$/.test(data.holderIdNumber.trim());
		},
		{
			path: ['holderIdNumber'],
			message: 'Para CI ingresa 8 digitos (incluye digito verificador, sin guion)'
		}
	)
	.refine(
		(data) =>
			data.psychology ||
			data.psychomotricity ||
			data.speechTherapy ||
			data.psychopedagogy ||
			data.pedagogicalSupport ||
			data.physiotherapy ||
			data.occupationalTherapy ||
			data.workshops,
		{
			path: ['treatmentsNotes'],
			message: 'Selecciona al menos un tratamiento'
		}
	)
	.superRefine((data, ctx) => {
		const today = todayYyyyMmDd();
		if (data.admissionDate && data.admissionDate > today) {
			ctx.addIssue({
				code: 'custom',
				path: ['admissionDate'],
				message: 'La fecha de inscripción no puede ser futura'
			});
		}

		if (
			data.admissionMode === 'agreement' &&
			data.agreementOrganization === 'BPS' &&
			data.agreementExpirationDate &&
			data.agreementExpirationDate < today
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['agreementExpirationDate'],
				message: 'La fecha de vencimiento no puede ser anterior a hoy'
			});
		}

		if (!data.holderPhone.trim()) return;
		if (isValidSupportedInternationalPhone(data.holderPhone)) return;
		ctx.addIssue({
			code: 'custom',
			path: ['holderPhone'],
			message: getInvalidSupportedPhoneMessage(data.holderPhone)
		});
	});

export type EnrollmentSchema = typeof enrollmentSchema;
