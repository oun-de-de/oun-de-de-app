import type { InvoiceType } from "@/core/types/invoice";

export const isInvoiceType = (value: string): value is InvoiceType => value === "invoice" || value === "receipt";

export function formatNumber(value?: number | null, fallback = "0"): string {
	if (typeof value !== "number" || Number.isNaN(value)) return fallback;
	return value.toLocaleString();
}

export function formatDisplayDate(value?: string | null, fallback = "-"): string {
	if (!value) return fallback;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return fallback;
	return parsed.toLocaleDateString();
}
