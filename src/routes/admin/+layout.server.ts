import { db } from '$lib/server/db';
import { enrollments, patients } from '$lib/server/db/schema';
import { and, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

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

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user?.id) {
		return { patientsCount: 0, remindersActiveCount: 0 };
	}

	const [row] = await db
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

	return {
		patientsCount: Number(row?.count ?? 0),
		remindersActiveCount: Number(remindersRow?.count ?? 0)
	};
};
