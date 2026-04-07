import { treatmentDayValues, treatmentTimeValues } from '$lib/domain/select-options';
import { treatmentLabels } from '$lib/utils';

export const treatmentTypeCodes = treatmentLabels.map(([code]) => code);

export type TreatmentTypeCode = (typeof treatmentLabels)[number][0];
export type TreatmentDay = '' | (typeof treatmentDayValues)[number];
export type TreatmentTime = '' | (typeof treatmentTimeValues)[number];

export type TreatmentAssignment = {
	treatmentType: TreatmentTypeCode | '';
	day: TreatmentDay;
	time: TreatmentTime;
	professionalName: string;
};

export const emptyTreatmentAssignment = (): TreatmentAssignment => ({
	treatmentType: '',
	day: '',
	time: '',
	professionalName: ''
});

export const treatmentOptions = treatmentLabels.map(([value, label]) => ({ value, label }));

export const isTreatmentTypeCode = (value: string): value is TreatmentTypeCode =>
	(treatmentTypeCodes as readonly string[]).includes(value);

const isTreatmentDay = (value: string): value is (typeof treatmentDayValues)[number] =>
	(treatmentDayValues as readonly string[]).includes(value);

const isTreatmentTime = (value: string): value is (typeof treatmentTimeValues)[number] =>
	(treatmentTimeValues as readonly string[]).includes(value);

export const parseTreatmentAssignments = (value: unknown): TreatmentAssignment[] => {
	if (!value) return [];

	let parsed: unknown;
	try {
		parsed = Array.isArray(value) ? value : typeof value === 'string' ? JSON.parse(value) : [];
	} catch {
		return [];
	}

	if (!Array.isArray(parsed)) return [];

	return parsed.flatMap((assignment) => {
		if (!assignment || typeof assignment !== 'object') return [];
		const obj = assignment as Record<string, unknown>;
		const rawTreatmentType =
			typeof obj.treatmentType === 'string'
				? obj.treatmentType.trim()
				: typeof obj.treatmentTypeCode === 'string'
					? obj.treatmentTypeCode.trim()
					: '';
		const rawDay = typeof obj.day === 'string' ? obj.day.trim() : '';
		const rawTime = typeof obj.time === 'string' ? obj.time.trim() : '';
		const professionalName =
			typeof obj.professionalName === 'string' ? obj.professionalName : '';

		return [
			{
				treatmentType: isTreatmentTypeCode(rawTreatmentType) ? rawTreatmentType : '',
				day: isTreatmentDay(rawDay) ? rawDay : '',
				time: isTreatmentTime(rawTime) ? rawTime : '',
				professionalName
			}
		];
	});
};

export const parseLegacyTreatmentSchedule = (value: unknown) => {
	if (!value) return [];
	let parsed: unknown;

	try {
		parsed = Array.isArray(value) ? value : typeof value === 'string' ? JSON.parse(value) : [];
	} catch {
		return [];
	}

	if (!Array.isArray(parsed)) return [];

	return parsed.flatMap((slot) => {
		if (!slot || typeof slot !== 'object') return [];
		const obj = slot as Record<string, unknown>;
		const rawDay = typeof obj.day === 'string' ? obj.day.trim() : '';
		const rawTime = typeof obj.time === 'string' ? obj.time.trim() : '';
		return [
			{
				day: isTreatmentDay(rawDay) ? rawDay : '',
				time: isTreatmentTime(rawTime) ? rawTime : ''
			}
		];
	});
};

export const buildLegacyTreatmentAssignments = (
	activeTreatmentValues: Partial<Record<TreatmentTypeCode, boolean>>,
	legacyScheduleValue: unknown
): TreatmentAssignment[] => {
	const activeTypes = treatmentLabels
		.map(([code]) => code)
		.filter((code) => Boolean(activeTreatmentValues[code]));
	const schedule = parseLegacyTreatmentSchedule(legacyScheduleValue);

	return activeTypes.map((treatmentType, index) => ({
		treatmentType,
		day: (schedule[index]?.day ?? '') as TreatmentDay,
		time: (schedule[index]?.time ?? '') as TreatmentTime,
		professionalName: ''
	}));
};

export const summarizeTreatmentAssignments = (assignments: TreatmentAssignment[]) => {
	const cleanAssignments = assignments.filter((assignment) => assignment.treatmentType);
	const activeTreatmentSet = new Set<TreatmentTypeCode>();
	for (const assignment of cleanAssignments) {
		if (assignment.treatmentType) {
			activeTreatmentSet.add(assignment.treatmentType);
		}
	}

	return {
		treatmentDaysPerWeek: cleanAssignments.length,
		treatmentSchedule: cleanAssignments.map(({ day, time }) => ({ day, time })),
		treatmentFlags: Object.fromEntries(
			treatmentLabels.map(([code]) => [code, activeTreatmentSet.has(code)])
		) as Record<TreatmentTypeCode, boolean>
	};
};

export const getTreatmentLabel = (code: string) =>
	treatmentLabels.find(([value]) => value === code)?.[1] ?? code;
