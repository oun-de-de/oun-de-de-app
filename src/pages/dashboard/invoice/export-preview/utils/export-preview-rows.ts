import type { InvoiceExportLineApi, InvoiceExportPreviewRow } from "@/core/types/invoice";
import { formatFlexibleDisplayDate, parseFlexibleDateToUtcTime } from "@/core/utils/date-display";
import { formatNumber as coreFormatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "@/pages/dashboard/reports/components/layout/report-template-table";
import type { SortMode } from "../constants";

const EMPTY_CELL = "-";

function formatNumber(value: number | null): string {
	if (value === null) return EMPTY_CELL;
	return coreFormatNumber(value);
}

function toReportRow(row: InvoiceExportPreviewRow, index: number): ReportTemplateRow {
	const originalAmount = getPreviewRowOriginalAmount(row);
	const received = row.paid;
	const balance = getPreviewRowBalance(row, originalAmount);

	return {
		key: `${row.refNo}-${row.productName ?? "no-item"}-${index}`,
		cells: {
			no: index + 1,
			customer: row.customerName,
			date: formatFlexibleDisplayDate(row.date, row.date ?? ""),
			refNo: row.refNo,
			// Report table cells use display fallbacks instead of raw nulls.
			productName: row.productName ?? EMPTY_CELL,
			unit: row.unit ?? EMPTY_CELL,
			price: formatNumber(row.pricePerProduct),
			quantity: formatNumber(row.quantity),
			amount: formatNumber(row.amount),
			total: formatNumber(row.total),
			memo: row.memo ?? EMPTY_CELL,
			received: formatNumber(received),
			balance: formatNumber(balance),
		},
	};
}

export function getPreviewRowOriginalAmount(row: InvoiceExportPreviewRow): number | null {
	return (
		row.amount ??
		row.total ??
		(row.pricePerProduct !== null && row.quantity !== null ? row.pricePerProduct * row.quantity : null)
	);
}

export function getPreviewRowBalance(row: InvoiceExportPreviewRow, originalAmount: number | null): number | null {
	if (row.balance !== null) return row.balance;
	if (originalAmount === null) return null;
	return Math.max(0, originalAmount - (row.paid ?? 0));
}

export function toInvoiceExportPreviewRow(line: InvoiceExportLineApi): InvoiceExportPreviewRow {
	// Preview rows are UI-facing: normalize nullable API fields into values the preview table can always render.
	return {
		refNo: line.refNo ?? "",
		customerName: line.customerName ?? "-",
		date: line.date ?? "",
		productName: line.productName ?? null,
		unit: line.unit ?? null,
		pricePerProduct: line.pricePerProduct ?? null,
		quantityPerProduct: line.quantityPerProduct ?? null,
		quantity: line.quantity ?? null,
		amount: line.amount ?? null,
		total: line.total ?? null,
		memo: line.memo ?? null,
		paid: line.paid ?? null,
		balance: line.balance ?? null,
	};
}

export function sortPreviewRows(previewRows: InvoiceExportPreviewRow[], sortMode: SortMode): InvoiceExportPreviewRow[] {
	const rows = [...previewRows];
	switch (sortMode) {
		case "date-desc":
			return rows.sort((a, b) => {
				const left = parseFlexibleDateToUtcTime(a.date);
				const right = parseFlexibleDateToUtcTime(b.date);
				return right - left;
			});
		case "date-asc":
			return rows.sort((a, b) => {
				const left = parseFlexibleDateToUtcTime(a.date);
				const right = parseFlexibleDateToUtcTime(b.date);
				return left - right;
			});
		case "customer-asc":
			return rows.sort((a, b) => a.customerName.localeCompare(b.customerName));
		case "balance-desc":
			return rows.sort((a, b) => {
				const left = getPreviewRowBalance(a, getPreviewRowOriginalAmount(a)) ?? 0;
				const right = getPreviewRowBalance(b, getPreviewRowOriginalAmount(b)) ?? 0;
				return right - left;
			});
		default:
			return rows;
	}
}

export function buildReportRows(previewRows: InvoiceExportPreviewRow[]): ReportTemplateRow[] {
	return previewRows.map(toReportRow);
}

export function buildReportRowsFromExportLines(exportLines: InvoiceExportLineApi[]): ReportTemplateRow[] {
	return exportLines.map((line, index) => toReportRow(toInvoiceExportPreviewRow(line), index));
}

export function calculateTotalBalance(previewRows: InvoiceExportPreviewRow[]): number {
	return previewRows.reduce((sum, row) => {
		const originalAmount = getPreviewRowOriginalAmount(row);
		const nextBalance = getPreviewRowBalance(row, originalAmount) ?? 0;
		return sum + nextBalance;
	}, 0);
}

export function calculateTotalReceived(previewRows: InvoiceExportPreviewRow[]): number {
	const paidByRefNo = new Map<string, number>();

	for (const row of previewRows) {
		const key = row.refNo?.trim();
		const paid = row.paid ?? 0;
		if (!key) continue;

		paidByRefNo.set(key, Math.max(paidByRefNo.get(key) ?? 0, paid));
	}

	return [...paidByRefNo.values()].reduce((sum, paid) => sum + paid, 0);
}
