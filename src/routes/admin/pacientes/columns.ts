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
	responsibleAdultName: string;
	attendsSchool: boolean;
	schoolName: string | null;
};

export const columns: ColumnDef<PatientRow>[] = [
	{
		id: 'patientName',
		header: 'Nombre',
		accessorFn: (row) => `${row.enrolledFirstName} ${row.enrolledLastName}`,
		cell: ({ row }) =>
			formatPersonName(`${row.original.enrolledFirstName} ${row.original.enrolledLastName}`)
	},
	{
		accessorKey: 'enrolledIdNumber',
		header: 'Documento',
		cell: ({ row }) => row.original.enrolledIdNumber
	},
	{
		header: 'Estado inscripción',
		id: 'statusLabel',
		accessorFn: (row) => (row.status === 'active' ? 'Activo' : 'Inactivo')
	},
	{
		header: 'Modo inscripción',
		id: 'admissionModeLabel',
		accessorFn: (row) => getOptionLabel(admissionModeOptions, row.admissionMode)
	},
	{
		accessorKey: 'admissionDate',
		header: 'Fecha inscripción',
		cell: ({ row }) => row.original.admissionDate
	},
	{
		accessorKey: 'responsibleAdultName',
		header: 'Adulto responsable',
		cell: ({ row }) => formatPersonName(row.original.responsibleAdultName)
	},
	{
		id: 'attendsSchoolLabel',
		header: 'Asiste a colegio',
		accessorFn: (row) => (row.attendsSchool ? 'Sí' : 'No')
	},
	{
		accessorKey: 'schoolName',
		header: 'Centro educativo',
		cell: ({ row }) =>
			row.original.schoolName ? formatPersonName(row.original.schoolName) : '-'
	}
];
