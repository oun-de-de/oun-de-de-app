/**
 * Shared normalize utilities.
 *
 * Centralizes common text/number sanitization helpers that were previously
 * duplicated across sidebar components and page-level URL parsers.
 */

/** Trim and lowercase a string. Handles `null` / `undefined` gracefully. */
export function normalizeText(value: string | null | undefined): string {
	return (value ?? "").trim().toLowerCase();
}

/**
 * Parse a string to a positive integer, falling back to `fallback` when the
 * value is missing or not a valid positive number.  Designed for URL search
 * params like `?page=2`.
 */
export function normalizePositiveInt(value: string | null, fallback: number): number {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
