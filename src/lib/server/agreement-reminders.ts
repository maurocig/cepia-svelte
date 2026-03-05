export type AgreementReminderType = '90d' | '30d';

export const AGREEMENT_REMINDER_TIMEZONE = 'America/Montevideo';
export const AGREEMENT_REMINDER_TYPES: readonly AgreementReminderType[] = ['90d', '30d'] as const;

export const parseDateUtc = (value: string) => {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
};

export const toYyyyMmDdUtc = (date: Date) => {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const addDaysUtc = (value: string, days: number) => {
	const date = parseDateUtc(value);
	date.setUTCDate(date.getUTCDate() + days);
	return toYyyyMmDdUtc(date);
};

export const daysBetweenUtc = (fromYyyyMmDd: string, toYyyyMmDd: string) => {
	const dayMs = 24 * 60 * 60 * 1000;
	return Math.round((parseDateUtc(toYyyyMmDd).getTime() - parseDateUtc(fromYyyyMmDd).getTime()) / dayMs);
};

export const yyyyMmDdInTimeZone = (date: Date, timeZone: string) => {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(date);

	const year = parts.find((part) => part.type === 'year')?.value;
	const month = parts.find((part) => part.type === 'month')?.value;
	const day = parts.find((part) => part.type === 'day')?.value;

	if (!year || !month || !day) {
		throw new Error(`Could not format date in timezone ${timeZone}`);
	}

	return `${year}-${month}-${day}`;
};

export const todayInTimeZone = (timeZone: string) => yyyyMmDdInTimeZone(new Date(), timeZone);

export const scheduledDateForType = (expirationDate: string, reminderType: AgreementReminderType) =>
	addDaysUtc(expirationDate, reminderType === '90d' ? -90 : -30);

export const nextCronRunDateInTimeZone = (
	now: Date,
	timeZone: string,
	hour: number,
	minute: number
) => {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(now);

	const year = parts.find((part) => part.type === 'year')?.value;
	const month = parts.find((part) => part.type === 'month')?.value;
	const day = parts.find((part) => part.type === 'day')?.value;
	const hourNow = Number(parts.find((part) => part.type === 'hour')?.value ?? NaN);
	const minuteNow = Number(parts.find((part) => part.type === 'minute')?.value ?? NaN);

	if (!year || !month || !day || Number.isNaN(hourNow) || Number.isNaN(minuteNow)) {
		throw new Error(`Could not compute next cron run in timezone ${timeZone}`);
	}

	const today = `${year}-${month}-${day}`;
	const beforeTodayRun = hourNow < hour || (hourNow === hour && minuteNow < minute);

	return beforeTodayRun ? today : addDaysUtc(today, 1);
};
