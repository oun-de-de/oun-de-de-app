import { parseISO } from "date-fns";
import type { InvoiceExportLineResult, InvoiceExportPreviewRow } from "@/core/types/invoice";
import { formatNumber as coreFormatNumber, formatDisplayDate } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "@/pages/dashboard/reports/components/layout/report-template-table";
import type { SortMode } from "../constants";

const EMPTY_CELL = "-";

function formatNumber(value: number | null): string {
	if (value === null) return EMPTY_CELL;
	return coreFormatNumber(value);
}

function formatReportDate(value: string): string {
	return formatDisplayDate(value, value);
}

export function resolveOriginalAmount(row: InvoiceExportPreviewRow): number | null {
	return (
		row.amount ??
		row.total ??
		(row.pricePerProduct !== null && row.quantity !== null ? row.pricePerProduct * row.quantity : null)
	);
}

export function resolveBalance(row: InvoiceExportPreviewRow, originalAmount: number | null): number | null {
	if (row.balance !== null) return row.balance;
	if (originalAmount === null) return null;
	return Math.max(0, originalAmount - (row.paid ?? 0));
}

export function mapExportLineToPreviewRow(line: InvoiceExportLineResult): InvoiceExportPreviewRow {
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
				const left = parseISO(a.date).getTime();
				const right = parseISO(b.date).getTime();
				return (Number.isNaN(right) ? 0 : right) - (Number.isNaN(left) ? 0 : left);
			});
		case "date-asc":
			return rows.sort((a, b) => {
				const left = parseISO(a.date).getTime();
				const right = parseISO(b.date).getTime();
				return (Number.isNaN(left) ? 0 : left) - (Number.isNaN(right) ? 0 : right);
			});
		case "customer-asc":
			return rows.sort((a, b) => a.customerName.localeCompare(b.customerName));
		case "balance-desc":
			return rows.sort((a, b) => {
				const left = resolveBalance(a, resolveOriginalAmount(a)) ?? 0;
				const right = resolveBalance(b, resolveOriginalAmount(b)) ?? 0;
				return right - left;
			});
		default:
			return rows;
	}
}

export function buildReportRows(previewRows: InvoiceExportPreviewRow[]): ReportTemplateRow[] {
	return previewRows.map((row, index) => {
		const originalAmount = resolveOriginalAmount(row);
		const received = row.paid;
		const balance = resolveBalance(row, originalAmount);

		return {
			key: `${row.refNo}-${row.productName ?? "no-item"}-${index}`,
			cells: {
				no: index + 1,
				customer: row.customerName,
				date: formatReportDate(row.date),
				refNo: row.refNo,
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
	});
}

export function calculateTotalBalance(previewRows: InvoiceExportPreviewRow[]): number {
	return previewRows.reduce((sum, row) => {
		const originalAmount = resolveOriginalAmount(row);
		const nextBalance = resolveBalance(row, originalAmount) ?? 0;
		return sum + nextBalance;
	}, 0);
}
