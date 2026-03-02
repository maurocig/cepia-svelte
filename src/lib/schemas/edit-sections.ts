import { z } from 'zod/v4';
import {
	admissionModeValues,
	agreementOrganizationValues,
	enrollmentStatusValues,
	idTypeValues,
	schoolShiftValues,
	schoolTypeValues
} from '$lib/domain/select-options';
import { getInvalidSupportedPhoneMessage, isValidSupportedInternationalPhone } from '$lib/phone';
import { todayYyyyMmDd } from '$lib/utils';

const nonEmpty = (msg: string) => z.string().trim().min(1, msg);
const dateYYYYMMDD = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)');

const checkboxBool = z.preprocess((v) => {
	if (typeof v === 'boolean') return v;
	if (typeof v !== 'string') return false;
	const s = v.toLowerCase();
	return s === 'true' || s === 'on' || s === '1';
}, z.boolean());

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
	z.preprocess((v) => (v === '' ? undefined : v), schema);

export const patientEditSchema = z
	.object({
		enrolledFirstName: nonEmpty('Nombre es requerido'),
		enrolledLastName: nonEmpty('Apellido es requerido'),
		enrolledIdType: z.enum(idTypeValues, { error: 'Tipo de documento inválido' }),
		enrolledIdNumber: nonEmpty('Número de documento es requerido'),
		enrolledDob: dateYYYYMMDD,
		enrolledAddress: nonEmpty('Dirección es requerida'),
		consultationReason: nonEmpty('Motivo de consulta es requerido')
	})
	.refine(
		(data) => {
			const doc = data.enrolledIdNumber.trim();
			if (!doc) return true;
			if (data.enrolledIdType === 'PAS') return /^[A-Za-z0-9]+$/.test(doc);
			return /^\d+$/.test(doc);
		},
		{ path: ['enrolledIdNumber'], message: 'Documento invalido para el tipo seleccionado' }
	)
	.refine(
		(data) => {
			const doc = data.enrolledIdNumber.trim();
			if (!doc) return true;
			if (data.enrolledIdType !== 'CI') return true;
			return /^\d{8}$/.test(doc);
		},
		{
			path: ['enrolledIdNumber'],
			message: 'Para CI ingresa 8 digitos (incluye digito verificador, sin guion)'
		}
	)
	.superRefine((data, ctx) => {
		if (data.enrolledDob > todayYyyyMmDd()) {
			ctx.addIssue({
				code: 'custom',
				path: ['enrolledDob'],
				message: 'La fecha de nacimiento no puede ser futura'
			});
		}
	});

export const enrollmentEditSchema = z
	.object({
		enrollmentStatus: z.enum(enrollmentStatusValues),
		admissionDate: dateYYYYMMDD,
		admissionMode: z.preprocess((v) => (v === '' ? undefined : v), z.enum(admissionModeValues).optional()),
		agreementOrganization: z.enum(agreementOrganizationValues).optional().or(z.literal('')).default(''),
		agreementOtherName: z.string().optional().or(z.literal('')).default(''),
		agreementExpirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).default(''),
		holderFirstName: nonEmpty('Ingresá el nombre del titular'),
		holderLastName: nonEmpty('Ingresá el apellido del titular'),
		holderIdType: z.enum(idTypeValues).optional().or(z.literal('')).default('CI'),
		holderIdNumber: nonEmpty('Ingresá el número de documento del titular'),
		holderPhone: z.string().trim().min(1, 'Ingresá el teléfono del titular'),
		holderEmail: z.string().trim().min(1, 'Ingresá el email del titular')
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
		{ path: ['agreementOrganization'], message: 'Seleccioná un convenio' }
	)
	.refine(
		(data) => {
			if (data.admissionMode !== 'agreement') return true;
			if (data.agreementOrganization !== 'BPS') return true;
			return Boolean(data.agreementExpirationDate);
		},
		{ path: ['agreementExpirationDate'], message: 'Ingresá la fecha de vencimiento del convenio BPS' }
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
			if (data.holderIdType === 'PAS') return /^[A-Za-z0-9]+$/.test(doc);
			return /^\d+$/.test(doc);
		},
		{ path: ['holderIdNumber'], message: 'Documento invalido para el tipo seleccionado' }
	)
	.refine(
		(data) => {
			const doc = data.holderIdNumber.trim();
			if (!doc) return true;
			if (data.holderIdType !== 'CI') return true;
			return /^\d{8}$/.test(doc);
		},
		{
			path: ['holderIdNumber'],
			message: 'Para CI ingresa 8 digitos (incluye digito verificador, sin guion)'
		}
	)
	.superRefine((data, ctx) => {
		const today = todayYyyyMmDd();
		if (data.admissionDate > today) {
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
		if (data.holderPhone.trim() && !isValidSupportedInternationalPhone(data.holderPhone)) {
			ctx.addIssue({
				code: 'custom',
				path: ['holderPhone'],
				message: getInvalidSupportedPhoneMessage(data.holderPhone)
			});
		}

		if (data.holderEmail.trim() && !z.string().email().safeParse(data.holderEmail).success) {
			ctx.addIssue({
				code: 'custom',
				path: ['holderEmail'],
				message: 'Ingresá un email válido'
			});
		}
	});

export const responsibleEditSchema = z
	.object({
		responsibleAdultName: nonEmpty('Adulto responsable es requerido'),
		responsibleAdultPhone: nonEmpty('Ingresá el teléfono del adulto responsable')
	})
	.superRefine((d, ctx) => {
		if (d.responsibleAdultPhone.trim() && !isValidSupportedInternationalPhone(d.responsibleAdultPhone)) {
			ctx.addIssue({
				code: 'custom',
				path: ['responsibleAdultPhone'],
				message: getInvalidSupportedPhoneMessage(d.responsibleAdultPhone)
			});
		}
	});

export const schoolEditSchema = z
	.object({
		attendsSchool: checkboxBool,
		schoolType: emptyToUndefined(z.enum(schoolTypeValues).optional()),
		schoolName: z.string().optional().or(z.literal('')),
		schoolGrade: emptyToUndefined(z.enum(['1', '2', '3', '4', '5', '6']).optional()),
		schoolShift: emptyToUndefined(z.enum(schoolShiftValues).optional())
	})
	.superRefine((d, ctx) => {
		if (d.attendsSchool) {
			if (!d.schoolType) {
				ctx.addIssue({ code: 'custom', path: ['schoolType'], message: 'Tipo de educación es requerido' });
			}
			if (!d.schoolName || d.schoolName.trim() === '') {
				ctx.addIssue({ code: 'custom', path: ['schoolName'], message: 'Centro educativo es requerido' });
			}
			if (!d.schoolShift) {
				ctx.addIssue({ code: 'custom', path: ['schoolShift'], message: 'Turno es requerido' });
			}
			if ((d.schoolType === 'primary' || d.schoolType === 'secondary') && !d.schoolGrade) {
				ctx.addIssue({ code: 'custom', path: ['schoolGrade'], message: 'Grado es requerido' });
			}
			if (d.schoolType === 'kindergarten' && d.schoolGrade) {
				ctx.addIssue({
					code: 'custom',
					path: ['schoolGrade'],
					message: 'En preescolar no corresponde grado'
				});
			}
		} else {
			const hasAnySchool =
				Boolean(d.schoolType) ||
				(d.schoolName && d.schoolName.trim() !== '') ||
				Boolean(d.schoolGrade) ||
				Boolean(d.schoolShift);
			if (hasAnySchool) {
				ctx.addIssue({
					code: 'custom',
					path: ['attendsSchool'],
					message: 'Si no asiste, no deberían venir datos de escuela'
				});
			}
		}
	});

export const familyEditSchema = z
	.object({
		motherDob: dateYYYYMMDD.optional().or(z.literal('')),
		motherOccupation: z.string().optional().or(z.literal('')),
		fatherDob: dateYYYYMMDD.optional().or(z.literal('')),
		fatherOccupation: z.string().optional().or(z.literal('')),
		siblingsCount: z
			.preprocess(
				(v) => {
					if (v === '' || v == null) return undefined;
					if (typeof v === 'number') return v;
					if (typeof v === 'string') return Number(v);
					return v;
				},
				z.number().int().min(0, 'No puede ser negativo').max(50, 'Demasiado alto').optional()
			),
		familyNotes: z.string().optional().or(z.literal(''))
	})
	.superRefine((d, ctx) => {
		const today = todayYyyyMmDd();
		if (d.motherDob && d.motherDob > today) {
			ctx.addIssue({
				code: 'custom',
				path: ['motherDob'],
				message: 'La fecha de nacimiento no puede ser futura'
			});
		}
		if (d.fatherDob && d.fatherDob > today) {
			ctx.addIssue({
				code: 'custom',
				path: ['fatherDob'],
				message: 'La fecha de nacimiento no puede ser futura'
			});
		}
	});

export const treatmentsEditSchema = z
	.object({
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
	);
