import { format } from "date-fns";

type FlexibleDateParts = { day: string; month: string; year: string };

function toUtcTime(year: string, month: string, day: string, endOfDay = false): number {
	return Date.UTC(
		Number(year),
		Number(month) - 1,
		Number(day),
		endOfDay ? 23 : 0,
		endOfDay ? 59 : 0,
		endOfDay ? 59 : 0,
		endOfDay ? 999 : 0,
	);
}

function extractFlexibleDateParts(value: string): FlexibleDateParts | undefined {
	const displayDateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+\d{2}:\d{2}:\d{2})?$/);
	if (displayDateMatch) {
		const [, day, month, year] = displayDateMatch;
		return { day, month, year };
	}

	const apiDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (apiDateMatch) {
		const [, year, month, day] = apiDateMatch;
		return { day, month, year };
	}

	return undefined;
}

export function formatFlexibleDisplayDate(value?: string | Date | null, fallback = "-"): string {
	if (!value) return fallback;

	if (value instanceof Date) {
		const year = value.getFullYear();
		const month = String(value.getMonth() + 1).padStart(2, "0");
		const day = String(value.getDate()).padStart(2, "0");
		return `${day}/${month}/${year}`;
	}

	const normalized = value.trim();
	if (!normalized) return fallback;

	const dateParts = extractFlexibleDateParts(normalized);
	if (dateParts) {
		return `${dateParts.day}/${dateParts.month}/${dateParts.year}`;
	}

	// Normalize "YYYY-MM-DD HH:mm:ss" into an ISO-like local datetime string.
	// If the backend omits timezone info, preserve that as local time instead of forcing UTC.
	let toParse = normalized;
	if (toParse.includes("T") || toParse.includes(" ")) {
		toParse = toParse.replace(" ", "T");
	}

	const parsed = new Date(toParse);
	if (Number.isNaN(parsed.getTime())) return fallback;
	return format(parsed, "dd/MM/yyyy");
}

export function parseFlexibleDateToUtcTime(value?: string | null, endOfDay = false): number {
	if (!value) return 0;

	const normalized = value.trim();
	if (!normalized) return 0;

	const dateParts = extractFlexibleDateParts(normalized);
	if (dateParts) {
		return toUtcTime(dateParts.year, dateParts.month, dateParts.day, endOfDay);
	}

	const parsed = Date.parse(normalized);
	return Number.isFinite(parsed) ? parsed : 0;
}
