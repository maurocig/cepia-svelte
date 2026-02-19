import { writable } from 'svelte/store';
import type { VisibilityState } from '@tanstack/table-core';

export type PatientsTableState = {
	filterColumnId: string;
	filterValue: string;
	columnVisibility: VisibilityState;
};

export const defaultPatientsTableState: PatientsTableState = {
	filterColumnId: 'patientName',
	filterValue: '',
	columnVisibility: {
		admissionModeLabel: false,
		responsibleAdultName: false,
		attendsSchoolLabel: false,
		schoolName: false
	}
};

export const patientsTableState = writable<PatientsTableState>(defaultPatientsTableState);
