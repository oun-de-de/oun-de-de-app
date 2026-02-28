import type { InvoiceType } from "@/core/types/invoice";

export const isInvoiceType = (value: string): value is InvoiceType => value === "invoice" || value === "receipt";

export function formatNumber(value?: number | null, fallback = "0"): string {
	if (typeof value !== "number" || Number.isNaN(value)) return fallback;
	return value.toLocaleString();
}

export function formatKHR(value?: number | null, fallback = "0 KHR"): string {
	if (typeof value !== "number" || Number.isNaN(value)) return fallback;
	return `${value.toLocaleString()} KHR`;
}

export function formatDisplayDate(value?: string | null, fallback = "-"): string {
	if (!value) return fallback;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return fallback;
	return parsed.toLocaleDateString();
}

export function formatDisplayDateTime(value?: string | null, fallback = "-"): string {
	if (!value) return fallback;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return fallback;
	return parsed.toLocaleString();
}
