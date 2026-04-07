import { clsx, type ClassValue } from 'clsx';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { twMerge } from 'tailwind-merge';

export function shuffle<T>(array: T[]) {
	let i = array.length;

	while (i--) {
		const j = Math.floor(Math.random() * i + 1);
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}

	return array;
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T> = T & { ref?: HTMLElement | null };
export type WithoutChild<T> = Omit<T, 'child'>;
export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;

export type DocumentIdType = 'CI' | 'DNI' | 'PAS' | '' | null | undefined;

export function sanitizeDocumentNumber(value: string, idType: DocumentIdType): string {
	if (idType === 'PAS') return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
	return value.replace(/\D/g, '');
}

export function formatDocumentNumber(value: string, idType: DocumentIdType): string {
	const normalized = sanitizeDocumentNumber(value, idType);
	if (!normalized) return '';

	if (idType === 'PAS') return normalized;

	if (idType === 'CI' && normalized.length >= 8) {
		const body = normalized.slice(0, -1);
		const verifier = normalized.slice(-1);
		const groupedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		return `${groupedBody}-${verifier}`;
	}

	return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function normalizeWhitespace(value: string): string {
	return value.trim().replace(/\s+/g, ' ');
}

export function toTitleCase(value: string): string {
	const lower = value.toLocaleLowerCase('es-UY');
	return lower.replace(/(^|[\s'’-])([a-záéíóúüñ])/giu, (match, prefix, letter) => {
		return `${prefix}${letter.toLocaleUpperCase('es-UY')}`;
	});
}

export function formatPersonName(value: string): string {
	return toTitleCase(normalizeWhitespace(value));
}

export function formatDateUy(date?: string | null): string {
	if (!date) return '-';
	const [year, month, day] = date.split('-').map((v) => Number(v));
	if (!year || !month || !day) return '-';
	return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function todayYyyyMmDd(): string {
	const now = new Date();
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const dd = String(now.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

export function ageFromDob(dob?: string | null): number | null {
	if (!dob) return null;
	const [year, month, day] = dob.split('-').map((v) => Number(v));
	if (!year || !month || !day) return null;

	const today = new Date();
	let age = today.getFullYear() - year;
	const hasHadBirthday =
		today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
	if (!hasHadBirthday) age -= 1;

	return age >= 0 ? age : null;
}

export const treatmentLabels = [
	['psychology', 'Psicología'],
	['psychomotricity', 'Psicomotricidad'],
	['speechTherapy', 'Fonoaudiología'],
	['psychopedagogy', 'Psicopedagogía'],
	['pedagogicalSupport', 'Apoyo pedagógico'],
	['physiotherapy', 'Fisioterapia'],
	['occupationalTherapy', 'Terapia ocupacional'],
	['workshops', 'Talleres']
] as const;

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};
