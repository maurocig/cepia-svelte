export type PatientRow = {
	enrollmentId: string;
	status: string;
	admissionDate: string;
	enrolledFirstName: string;
	enrolledLastName: string;
	enrolledIdNumber: string;
	responsibleAdultName: string;
	responsibleAdultPhone: string;
	attendsSchool: boolean;
	schoolName: string | null;
	consultationReason: string;
};

import type { ColumnDef } from '@tanstack/table-core';

export const columns: ColumnDef<PatientRow>[] = [
	{
		id: 'patientName',
		header: 'Nombre',
		accessorFn: (row) => `${row.enrolledFirstName} ${row.enrolledLastName}`
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
		accessorKey: 'admissionDate',
		header: 'Fecha inscripción',
		cell: ({ row }) => row.original.admissionDate
	},
	{
		accessorKey: 'responsibleAdultName',
		header: 'Adulto responsable',
		cell: ({ row }) => row.original.responsibleAdultName
	},
	{
		accessorKey: 'responsibleAdultPhone',
		header: 'Tel. responsable',
		cell: ({ row }) => row.original.responsibleAdultPhone
	},
	{
		id: 'attendsSchoolLabel',
		header: 'Asiste a colegio',
		accessorFn: (row) => (row.attendsSchool ? 'Sí' : 'No')
	},
	{
		accessorKey: 'schoolName',
		header: 'Centro educativo',
		cell: ({ row }) => row.original.schoolName ?? '-'
	},
	{
		accessorKey: 'consultationReason',
		header: 'Motivo de consulta',
		cell: ({ row }) => row.original.consultationReason
	}
];
