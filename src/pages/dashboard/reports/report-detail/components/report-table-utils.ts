import type { SortMode } from "../../../invoice/export-preview/constants";
import type { ReportTemplateRow } from "../../components/layout/report-template-table";
import type { ReportFiltersValue } from "./report-filters";

export function normalizeReportFilters(filters?: ReportFiltersValue) {
	const customerId = filters?.customerId && filters.customerId !== "all" ? filters.customerId : undefined;
	const customerTypeId =
		filters?.customerTypeId && filters.customerTypeId !== "all" ? filters.customerTypeId : undefined;
	const productName = filters?.productName && filters.productName !== "all" ? filters.productName : undefined;
	const isDateRange = filters?.useDateRange === true;
	const reportDateFrom =
		filters?.fromDate && /^\d{4}-\d{2}-\d{2}$/.test(filters.fromDate) ? `${filters.fromDate}T00:00:00` : undefined;
	const targetToDate = isDateRange ? filters?.toDate : filters?.fromDate;
	const reportDateTo =
		targetToDate && /^\d{4}-\d{2}-\d{2}$/.test(targetToDate) ? `${targetToDate}T23:59:59` : undefined;

	return { customerId, customerTypeId, productName, reportDateFrom, reportDateTo };
}

export function formatFilterRange(filters?: Partial<ReportFiltersValue>): string {
	if (!filters?.fromDate && !filters?.toDate) return "No date selected";

	// Single date mode or only fromDate provided
	if (filters.fromDate && (!filters.useDateRange || !filters.toDate)) {
		return formatFilterDateForDisplay(filters.fromDate);
	}

	// Only toDate provided
	if (!filters.fromDate && filters.toDate) {
		return formatFilterDateForDisplay(filters.toDate);
	}

	const fromDate = formatFilterDateForDisplay(filters.fromDate);
	const toDate = formatFilterDateForDisplay(filters.toDate);
	return filters.fromDate === filters.toDate ? fromDate : `${fromDate} To ${toDate}`;
}

export function formatFilterDateForDisplay(value?: string): string {
	if (!value) return "Not selected";
	const monthMatch = value.match(/^(\d{4})-(\d{2})$/);
	if (monthMatch) {
		const [, year, month] = monthMatch;
		return `${month}/${year}`;
	}
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return value;
	const [, year, month, day] = match;
	return `${day}/${month}/${year}`;
}

export function isReportMonthFilterValue(value?: string): boolean {
	if (!value) return false;
	const match = value.match(/^(\d{4})-(\d{2})$/);
	if (!match) return false;
	const month = Number(match[2]);
	return month >= 1 && month <= 12;
}

export function parseReportDateInput(value?: string, endOfDay = false): number {
	if (!value) {
		return endOfDay ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
	}
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return Number.NaN;
	const [, year, month, day] = match;
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

export function parseDisplayDate(value: unknown): number {
	if (typeof value !== "string") return 0;
	const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (!match) return 0;
	const [, day, month, year] = match;
	return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

export function parseNumericCell(value: unknown): number {
	if (typeof value === "number") return value;
	if (typeof value !== "string") return 0;
	const trimmed = value.trim();
	// Accounting negative format: "(1,234.56)" → -1234.56
	const accountingMatch = trimmed.match(/^\(([^)]+)\)$/);
	const body = accountingMatch ? `-${accountingMatch[1]}` : trimmed;
	// European locale: "1.234,56" → "1234.56"
	const hasDotThousands = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(body);
	const hasCommaDecimal = /,\d{2}$/.test(body) && !/\.\d{2}$/.test(body);
	let normalized: string;
	if (hasDotThousands) {
		// Dot as thousands separator, optional comma decimal
		normalized = body.replace(/\./g, "").replace(",", ".");
	} else if (hasCommaDecimal) {
		// Comma as decimal separator
		const lastCommaIdx = body.lastIndexOf(",");
		normalized = `${body.substring(0, lastCommaIdx).replace(/,/g, "")}.${body.substring(lastCommaIdx + 1)}`;
	} else {
		// Comma as thousands separator only
		normalized = body.replace(/,/g, "");
	}
	// Strip remaining non-numeric chars except minus and dot
	normalized = normalized.replace(/[^\d.-]/g, "");
	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : 0;
}

function getTextCell(row: ReportTemplateRow, ...keys: string[]): string {
	for (const key of keys) {
		const value = row.cells[key];
		if (typeof value === "string" && value.trim()) return value;
	}
	return "";
}

type RowComparator = (left: ReportTemplateRow, right: ReportTemplateRow) => number;

/**
 * Sorts only the runs of data rows between structural rows (group headers, subtotals, grand
 * totals), leaving those in place. On a flat report this is a plain sort of the whole array.
 */
function sortWithinGroups(rows: ReportTemplateRow[], compare: RowComparator): ReportTemplateRow[] {
	const sorted: ReportTemplateRow[] = [];
	let run: ReportTemplateRow[] = [];

	for (const row of rows) {
		if (row.isStructural) {
			sorted.push(...run.sort(compare), row);
			run = [];
			continue;
		}
		run.push(row);
	}

	sorted.push(...run.sort(compare));
	return sorted;
}

export function sortReportRows(rows: ReportTemplateRow[], sortMode: SortMode): ReportTemplateRow[] {
	if (sortMode === "default" || rows.length === 0) return rows;

	const nextRows = [...rows];

	if (sortMode === "date-desc" || sortMode === "date-asc") {
		const dateCache = new Map<string, number>();
		const getCachedDate = (val: unknown) => {
			if (typeof val !== "string") return 0;
			// Assumes date is in "DD/MM/YYYY" format as per parseDisplayDate, adjust if different format is used
			const cached = dateCache.get(val);
			if (cached !== undefined) return cached;
			const parsed = parseDisplayDate(val);
			dateCache.set(val, parsed);
			return parsed;
		};
		return sortWithinGroups(nextRows, (left, right) => {
			const l = getCachedDate(left.cells.date ?? left.cells.cycle);
			const r = getCachedDate(right.cells.date ?? right.cells.cycle);
			return sortMode === "date-desc" ? r - l : l - r;
		});
	}

	if (sortMode === "customer-asc") {
		const textCache = new Map<string, string>();
		const getCachedText = (row: ReportTemplateRow) => {
			if (!textCache.has(row.key)) {
				textCache.set(row.key, getTextCell(row, "customer", "name", "category"));
			}
			return textCache.get(row.key) ?? "";
		};
		return sortWithinGroups(nextRows, (left, right) => getCachedText(left).localeCompare(getCachedText(right)));
	}

	if (sortMode === "balance-desc") {
		const numCache = new Map<string, number>();
		const getCachedNum = (value: unknown) => {
			const key = String(value);
			const cached = numCache.get(key);
			if (cached !== undefined) return cached;
			const parsed = parseNumericCell(value);
			numCache.set(key, parsed);
			return parsed;
		};
		return sortWithinGroups(nextRows, (left, right) => {
			const l = getCachedNum(
				left.cells.balance ??
					left.cells.amount ??
					left.cells.value ??
					left.cells.debit ??
					left.cells.outstanding ??
					left.cells.invoiceTotal,
			);
			const r = getCachedNum(
				right.cells.balance ??
					right.cells.amount ??
					right.cells.value ??
					right.cells.debit ??
					right.cells.outstanding ??
					right.cells.invoiceTotal,
			);
			return r - l;
		});
	}

	return nextRows;
}
