import { writable } from 'svelte/store';
import type { SortingState, VisibilityState } from '@tanstack/table-core';

export type PatientsTableState = {
	filterColumnId: string;
	filterValue: string;
	columnVisibility: VisibilityState;
	sorting: SortingState;
};

export const defaultPatientsTableState: PatientsTableState = {
	filterColumnId: 'patientName',
	filterValue: '',
	sorting: [{ id: 'admissionDate', desc: true }],
	columnVisibility: {
		admissionModeLabel: false,
		responsibleAdultName: false,
		attendsSchoolLabel: false,
		schoolName: false
	}
};

export const patientsTableState = writable<PatientsTableState>(defaultPatientsTableState);
