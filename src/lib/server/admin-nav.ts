import { db } from '$lib/server/db';
import { enrollments, patients } from '$lib/server/db/schema';
import { and, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';

export type AdminNavLink = {
	href: string;
	label: string;
	match?: 'exact' | 'prefix';
	rightText?: string;
	rightVariant?: 'default' | 'alert';
};

type AdminUser = {
	id?: string | null;
	name?: string | null;
	email?: string | null;
};

export type AdminNavData = {
	links: AdminNavLink[];
	patientsCount: number;
	remindersActiveCount: number;
	username: string;
};

const addDaysYyyyMmDd = (base: string, days: number) => {
	const [year, month, day] = base.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	date.setUTCDate(date.getUTCDate() + days);
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, '0');
	const d = String(date.getUTCDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
};

const todayYyyyMmDd = () => {
	const now = new Date();
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const dd = String(now.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
};

export const buildAdminNavLinks = ({
	patientsCount,
	remindersActiveCount,
	username
}: Pick<AdminNavData, 'patientsCount' | 'remindersActiveCount' | 'username'>): AdminNavLink[] => [
	{ href: '/admin', label: 'Inicio' },
	{ href: '/admin/pacientes', label: 'Pacientes', rightText: String(patientsCount ?? 0) },
	{
		href: '/admin/recordatorios',
		label: 'Recordatorios',
		rightText: remindersActiveCount ? String(remindersActiveCount) : undefined,
		rightVariant: 'alert'
	},
	{ href: '/admin/profile', label: `Perfil (${username})`, match: 'exact' },
	{ href: '/admin/pacientes/nuevo', label: 'Ingresar paciente' }
];

export const loadAdminNavData = async (user: AdminUser | null | undefined): Promise<AdminNavData> => {
	const username = user?.name || user?.email?.split('@')?.[0] || 'usuario';

	if (!user?.id) {
		return {
			links: buildAdminNavLinks({
				patientsCount: 0,
				remindersActiveCount: 0,
				username
			}),
			patientsCount: 0,
			remindersActiveCount: 0,
			username
		};
	}

	const [patientsRow] = await db
		.select({ count: sql<number>`count(*)` })
		.from(enrollments)
		.innerJoin(patients, eq(patients.enrollmentId, enrollments.id))
		.where(eq(enrollments.formStatus, 'completed'));

	const today = todayYyyyMmDd();
	const in90Days = addDaysYyyyMmDd(today, 90);

	const [remindersRow] = await db
		.select({ count: sql<number>`count(*)` })
		.from(enrollments)
		.where(
			and(
				eq(enrollments.formStatus, 'completed'),
				eq(enrollments.admissionMode, 'agreement'),
				eq(enrollments.agreementOrganization, 'BPS'),
				isNotNull(enrollments.agreementExpirationDate),
				gte(enrollments.agreementExpirationDate, today),
				lte(enrollments.agreementExpirationDate, in90Days)
			)
		);

	const patientsCount = Number(patientsRow?.count ?? 0);
	const remindersActiveCount = Number(remindersRow?.count ?? 0);

	return {
		links: buildAdminNavLinks({
			patientsCount,
			remindersActiveCount,
			username
		}),
		patientsCount,
		remindersActiveCount,
		username
	};
};
