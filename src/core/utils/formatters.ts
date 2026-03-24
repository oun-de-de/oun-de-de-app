import { format } from "date-fns";

export function formatNumber(value?: number | null, fallback = "0"): string {
	if (typeof value !== "number" || Number.isNaN(value)) return fallback;
	return value.toLocaleString();
}

export function formatKHR(value?: number | null, fallback = "0 KHR"): string {
	if (typeof value !== "number" || Number.isNaN(value)) return fallback;
	return `${value.toLocaleString()} KHR`;
}

function parseToLocalTime(value: string): Date {
	// If it's a pure date "YYYY-MM-DD", parse as local midnight to prevent day shifting
	if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
		const [y, m, d] = value.trim().split("-").map(Number);
		return new Date(y, m - 1, d);
	}

	let normalized = value.trim();
	// Normalize "YYYY-MM-DD HH:mm:ss" into an ISO-like local datetime string.
	// If the backend omits timezone info, preserve that as local time instead of forcing UTC.
	if (normalized.includes("T") || normalized.includes(" ")) {
		normalized = normalized.replace(" ", "T");
	}
	return new Date(normalized);
}

export function formatDisplayDate(value?: string | null, fallback = "-"): string {
	if (!value) return fallback;
	const parsed = parseToLocalTime(value);
	if (Number.isNaN(parsed.getTime())) return fallback;
	return format(parsed, "dd/MM/yyyy");
}

export function formatDisplayDateTime(value?: string | null, fallback = "-"): string {
	if (!value) return fallback;
	const parsed = parseToLocalTime(value);
	if (Number.isNaN(parsed.getTime())) return fallback;
	return format(parsed, "dd/MM/yyyy HH:mm:ss");
}

export function formatDateTime(value?: string | null, fallback = "-"): string {
	if (!value) return fallback;
	try {
		const parsed = parseToLocalTime(value);
		if (Number.isNaN(parsed.getTime())) return fallback;
		return format(parsed, "dd/MM/yyyy HH:mm");
	} catch {
		return fallback;
	}
}
