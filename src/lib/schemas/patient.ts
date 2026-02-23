import { z } from 'zod/v4';
import { getInvalidSupportedPhoneMessage, isValidSupportedInternationalPhone } from '$lib/phone';
import { idTypeValues, schoolShiftValues, schoolTypeValues } from '$lib/domain/select-options';
import { todayYyyyMmDd } from '$lib/utils';

const dateYYYYMMDD = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)');

const nonEmpty = (msg: string) => z.string().refine((v) => v.trim().length > 0, { message: msg });

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
	z.preprocess((v) => (v === '' ? undefined : v), schema);

// para checkbox hidden input: a veces llega "true"/"false", a veces "on"
const checkboxBool = z.preprocess((v) => {
	if (typeof v === 'boolean') return v;
	if (typeof v !== 'string') return false;
	const s = v.toLowerCase();
	return s === 'true' || s === 'on' || s === '1';
}, z.boolean());

export const patientSchema = z
	.object({
		// paciente
		enrolledFirstName: nonEmpty('Nombre es requerido'),
		enrolledLastName: nonEmpty('Apellido es requerido'),
		enrolledDob: dateYYYYMMDD,

		enrolledIdType: z.enum(idTypeValues, {
			error: 'Tipo de documento inválido'
		}),
		enrolledIdNumber: nonEmpty('Número de documento es requerido'),
		enrolledAddress: nonEmpty('Dirección es requerida'),

		responsibleAdultName: nonEmpty('Adulto responsable es requerido'),
		responsibleAdultPhone: nonEmpty('Ingresá el teléfono del adulto responsable'),

		consultationReason: nonEmpty('Motivo de consulta es requerido'),

		attendsSchool: checkboxBool,

		schoolType: emptyToUndefined(z.enum(schoolTypeValues).optional()),
		schoolName: z.string().optional().or(z.literal('')),
		schoolGrade: emptyToUndefined(z.enum(['1', '2', '3', '4', '5', '6']).optional()),
		schoolShift: emptyToUndefined(z.enum(schoolShiftValues).optional()),

		// núcleo familiar
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
	.refine(
		(data) => {
			const doc = data.enrolledIdNumber.trim();
			if (!doc) return true;

			if (data.enrolledIdType === 'PAS') return /^[A-Za-z0-9]+$/.test(doc);
			return /^\d+$/.test(doc);
		},
		{
			path: ['enrolledIdNumber'],
			message: 'Documento invalido para el tipo seleccionado'
		}
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
	.superRefine((d, ctx) => {
		const today = todayYyyyMmDd();
		if (d.enrolledDob > today) {
			ctx.addIssue({
				code: 'custom',
				path: ['enrolledDob'],
				message: 'La fecha de nacimiento no puede ser futura'
			});
		}
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

		if (d.responsibleAdultPhone.trim() && !isValidSupportedInternationalPhone(d.responsibleAdultPhone)) {
			ctx.addIssue({
				code: 'custom',
				path: ['responsibleAdultPhone'],
				message: getInvalidSupportedPhoneMessage(d.responsibleAdultPhone)
			});
		}

		// escuela: requerido si asiste
		if (d.attendsSchool) {
			if (!d.schoolType) {
				ctx.addIssue({
					code: 'custom',
					path: ['schoolType'],
					message: 'Tipo de educación es requerido'
				});
			}

			if (!d.schoolName || d.schoolName.trim() === '') {
				ctx.addIssue({
					code: 'custom',
					path: ['schoolName'],
					message: 'Centro educativo es requerido'
				});
			}

			if (!d.schoolShift) {
				ctx.addIssue({
					code: 'custom',
					path: ['schoolShift'],
					message: 'Turno es requerido'
				});
			}

			// grado: solo para primary/secondary
			if (d.schoolType === 'primary' || d.schoolType === 'secondary') {
				if (!d.schoolGrade) {
					ctx.addIssue({
						code: 'custom',
						path: ['schoolGrade'],
						message: 'Grado es requerido'
					});
				}
			}

			// jardín: grado no aplica (si viene seteado, lo marcamos)
			if (d.schoolType === 'kindergarten') {
				if (d.schoolGrade) {
					ctx.addIssue({
						code: 'custom',
						path: ['schoolGrade'],
						message: 'En preescolar no corresponde grado'
					});
				}
			}
		} else {
			// si NO asiste, forzamos vacío para evitar estados raros
			// (esto es opcional, lo dejé estricto para que no se te guarde basura)
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

export type PatientStep2 = z.infer<typeof patientSchema>;
