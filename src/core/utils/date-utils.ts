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
