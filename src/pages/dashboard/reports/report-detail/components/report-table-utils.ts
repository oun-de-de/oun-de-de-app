import type { SortMode } from "../../../invoice/export-preview/constants";
import type { ReportTemplateRow } from "../../components/layout/report-template-table";
import type { ReportFiltersValue } from "./report-filters";

export function normalizeReportFilters(filters?: ReportFiltersValue) {
	const customerId = filters?.customerId && filters.customerId !== "all" ? filters.customerId : undefined;
	const reportDateFrom = filters?.useDateRange && filters.fromDate ? `${filters.fromDate}T00:00:00` : undefined;
	const reportDateTo = filters?.useDateRange && filters.toDate ? `${filters.toDate}T23:59:59` : undefined;

	return { customerId, reportDateFrom, reportDateTo };
}

export function formatFilterRange(filters?: ReportFiltersValue): string {
	if (!filters?.useDateRange || !filters.fromDate || !filters.toDate) return "All Dates";
	return filters.fromDate === filters.toDate ? filters.fromDate : `${filters.fromDate} To ${filters.toDate}`;
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
	const normalized = value.replace(/[^\d.-]/g, "");
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

export function sortReportRows(rows: ReportTemplateRow[], sortMode: SortMode): ReportTemplateRow[] {
	if (sortMode === "default" || rows.length === 0) return rows;

	const nextRows = [...rows];

	if (sortMode === "date-desc" || sortMode === "date-asc") {
		const dateCache = new Map<string, number>();
		const getCachedDate = (val: unknown) => {
			if (typeof val !== "string") return 0;
			if (!dateCache.has(val)) dateCache.set(val, parseDisplayDate(val));
			return dateCache.get(val)!;
		};
		return nextRows.sort((left, right) => {
			const l = getCachedDate(left.cells.date);
			const r = getCachedDate(right.cells.date);
			return sortMode === "date-desc" ? r - l : l - r;
		});
	}

	if (sortMode === "customer-asc") {
		const textCache = new Map<string, string>();
		const getCachedText = (row: ReportTemplateRow) => {
			if (!textCache.has(row.key)) {
				textCache.set(row.key, getTextCell(row, "customer", "name", "category"));
			}
			return textCache.get(row.key)!;
		};
		return nextRows.sort((left, right) => getCachedText(left).localeCompare(getCachedText(right)));
	}

	if (sortMode === "balance-desc") {
		const numCache = new Map<string, number>();
		const getCachedNum = (value: unknown) => {
			const key = String(value);
			if (!numCache.has(key)) numCache.set(key, parseNumericCell(value));
			return numCache.get(key)!;
		};
		return nextRows.sort((left, right) => {
			const l = getCachedNum(left.cells.balance ?? left.cells.amount ?? left.cells.value ?? left.cells.debit);
			const r = getCachedNum(right.cells.balance ?? right.cells.amount ?? right.cells.value ?? right.cells.debit);
			return r - l;
		});
	}

	return nextRows;
}
