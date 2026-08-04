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

const STORAGE_KEY = 'patients-table-state';

function sanitizePatientsTableState(
	value: Partial<PatientsTableState> | null | undefined
): PatientsTableState {
	return {
		filterColumnId: value?.filterColumnId ?? defaultPatientsTableState.filterColumnId,
		filterValue: value?.filterValue ?? defaultPatientsTableState.filterValue,
		columnVisibility: value?.columnVisibility ?? defaultPatientsTableState.columnVisibility,
		sorting: value?.sorting ?? defaultPatientsTableState.sorting
	};
}

function loadInitialState(): PatientsTableState {
	if (typeof window === 'undefined') return defaultPatientsTableState;

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultPatientsTableState;
		const parsed = JSON.parse(raw) as Partial<PatientsTableState>;
		return sanitizePatientsTableState(parsed);
	} catch {
		return defaultPatientsTableState;
	}
}

function createPatientsTableStateStore() {
	const store = writable<PatientsTableState>(loadInitialState());

	if (typeof window !== 'undefined') {
		store.subscribe((value) => {
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
			} catch {
				// ignore write errors (private mode, quota, etc.)
			}
		});
	}

	return store;
}

export const patientsTableState = createPatientsTableStateStore();
