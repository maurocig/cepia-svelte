import type { ColumnDef } from '@tanstack/table-core';
import { formatPersonName } from '$lib/utils';
import { admissionModeOptions, getOptionLabel } from '$lib/domain/select-options';

export type PatientRow = {
	enrollmentId: string;
	status: string;
	admissionMode: string | null;
	admissionDate: string;
	enrolledFirstName: string;
	enrolledLastName: string;
	enrolledIdNumber: string;
	holderFirstName: string;
	holderLastName: string;
	responsibleAdultName: string;
	attendsSchool: boolean;
	schoolName: string | null;
};

export const columns: ColumnDef<PatientRow>[] = [
	{
		id: 'patientName',
		header: 'Nombre',
		enableSorting: true,
		accessorFn: (row) => `${row.enrolledFirstName} ${row.enrolledLastName}`,
		cell: ({ row }) =>
			formatPersonName(`${row.original.enrolledFirstName} ${row.original.enrolledLastName}`)
	},
	{
		accessorKey: 'enrolledIdNumber',
		enableSorting: false,
		header: 'Documento',
		cell: ({ row }) => row.original.enrolledIdNumber
	},
	{
		id: 'holderName',
		enableSorting: false,
		header: 'Titular',
		accessorFn: (row) => `${row.holderFirstName} ${row.holderLastName}`,
		cell: ({ row }) =>
			formatPersonName(`${row.original.holderFirstName} ${row.original.holderLastName}`)
	},
	{
		header: 'Estado inscripción',
		id: 'statusLabel',
		enableSorting: false,
		accessorFn: (row) => (row.status === 'active' ? 'Activo' : 'Inactivo')
	},
	{
		header: 'Modo inscripción',
		id: 'admissionModeLabel',
		enableSorting: false,
		accessorFn: (row) => getOptionLabel(admissionModeOptions, row.admissionMode)
	},
	{
		accessorKey: 'admissionDate',
		enableSorting: true,
		header: 'Fecha inscripción',
		cell: ({ row }) => row.original.admissionDate
	},
	{
		accessorKey: 'responsibleAdultName',
		enableSorting: false,
		header: 'Adulto responsable',
		cell: ({ row }) => formatPersonName(row.original.responsibleAdultName)
	},
	{
		id: 'attendsSchoolLabel',
		header: 'Asiste a colegio',
		enableSorting: false,
		accessorFn: (row) => (row.attendsSchool ? 'Sí' : 'No')
	},
	{
		accessorKey: 'schoolName',
		enableSorting: false,
		header: 'Centro educativo',
		cell: ({ row }) => (row.original.schoolName ? formatPersonName(row.original.schoolName) : '-')
	}
];
