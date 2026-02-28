/**
 * Returns a Date object representing the start of the current day in UTC (00:00:00.000Z).
 * Useful for initializing date inputs that should be timezone-agnostic.
 */
export function getTodayUTC(): Date {
	const d = new Date();
	return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/**
 * Formats a Date object to "YYYY-MM-DD" string using UTC methods.
 * Returns an empty string if the date is invalid.
 * Useful for <input type="date" /> values where the date should not be shifted by local timezone.
 */
export function formatDateToYYYYMMDD(date: Date | null | undefined): string {
	if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toISOString().split("T")[0];
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UTC_DAY_START_SUFFIX = "T00:00:00.000Z";

function isValidDate(date: Date): boolean {
	return !Number.isNaN(date.getTime());
}

function isDateOnlyString(value: string): boolean {
	return DATE_ONLY_PATTERN.test(value);
}

function isStartOfDay(date: Date): boolean {
	const isUtcStartOfDay =
		date.getUTCHours() === 0 &&
		date.getUTCMinutes() === 0 &&
		date.getUTCSeconds() === 0 &&
		date.getUTCMilliseconds() === 0;
	if (isUtcStartOfDay) return true;

	return date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
}

function parseDateInput(value: unknown): Date | undefined {
	if (value instanceof Date) {
		return isValidDate(value) ? value : undefined;
	}

	if (typeof value !== "string") return undefined;
	const normalized = value.trim();
	if (!normalized) return undefined;

	const parsed = isDateOnlyString(normalized) ? new Date(`${normalized}${UTC_DAY_START_SUFFIX}`) : new Date(normalized);
	return isValidDate(parsed) ? parsed : undefined;
}

function toDateOnlyIso(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/**
 * Normalize date-like input to UTC ISO string.
 * - `YYYY-MM-DD` is interpreted as UTC start of day.
 * - Date objects and datetime strings are converted with `.toISOString()`.
 */
export function toUtcIsoStartOfDay(value: unknown): string | undefined {
	const parsed = parseDateInput(value);
	return parsed?.toISOString();
}

/**
 * Normalize date-like input to UTC ISO string.
 * If input is "today" as a date-only value, returns current UTC timestamp.
 */
export function toUtcIsoPreferNowIfToday(value: unknown): string | undefined {
	const now = new Date();
	const nowIso = now.toISOString();
	const today = toDateOnlyIso(now);

	if (value instanceof Date && isValidDate(value) && isStartOfDay(value) && toDateOnlyIso(value) === today)
		return nowIso;

	if (typeof value === "string") {
		const normalized = value.trim();
		if (isDateOnlyString(normalized) && normalized === today) return nowIso;
	}

	return toUtcIsoStartOfDay(value);
}
