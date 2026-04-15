import * as XLSX from "xlsx";
import type { InvoiceExportLineApi } from "@/core/types/invoice";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";

const EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function getOriginalAmount(row: InvoiceExportLineApi): number | null {
	return row.amount ?? row.total ?? null;
}

function getReceivedAmount(row: InvoiceExportLineApi): number | null {
	if (row.paid !== null && row.paid !== undefined && row.paid > 0) return row.paid;

	const originalAmount = getOriginalAmount(row);
	if (row.balance !== null && row.balance !== undefined && originalAmount !== null) {
		return Math.max(0, originalAmount - row.balance);
	}

	return originalAmount;
}

type TemplateColumn = {
	label: string;
	width: number;
	map: (row: InvoiceExportLineApi, index: number) => string | number | null;
};

const TEMPLATE_COLUMNS: TemplateColumn[] = [
	{ label: "NO", width: 8, map: (_row, index) => index + 1 },
	{ label: "REF NO", width: 18, map: (row) => row.refNo ?? "" },
	{ label: "CUSTOMER", width: 24, map: (row) => row.customerName ?? "" },
	{ label: "DATE", width: 14, map: (row) => formatFlexibleDisplayDate(row.date, row.date ?? "") },
	{ label: "PRODUCT NAME", width: 28, map: (row) => row.productName ?? "" },
	{ label: "UNIT", width: 12, map: (row) => row.unit ?? "" },
	{ label: "PRICE", width: 14, map: (row) => row.pricePerProduct ?? null },
	{ label: "QTY / PRODUCT", width: 16, map: (row) => row.quantityPerProduct ?? null },
	{ label: "QTY", width: 12, map: (row) => row.quantity ?? null },
	{ label: "AMOUNT", width: 16, map: (row) => row.amount ?? null },
	{ label: "TOTAL", width: 16, map: (row) => row.total ?? null },
	{ label: "RECEIVED", width: 16, map: (row) => getReceivedAmount(row) },
	{ label: "BALANCE", width: 16, map: (row) => row.balance ?? null },
	{ label: "MEMO", width: 30, map: (row) => row.memo ?? "" },
];

export function buildInvoiceExportBlob(
	rows: InvoiceExportLineApi[],
	options?: {
		includeReceived?: boolean;
	},
): Blob {
	const visibleColumns =
		options?.includeReceived === false
			? TEMPLATE_COLUMNS.filter((column) => column.label !== "RECEIVED")
			: TEMPLATE_COLUMNS;
	const headerRow = visibleColumns.map((column) => column.label);
	const dataRows = rows.map((row, index) => visibleColumns.map((column) => column.map(row, index)));
	const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
	worksheet["!cols"] = visibleColumns.map((column) => ({ wch: column.width }));

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice Export");

	const workbookBuffer = XLSX.write(workbook, {
		bookType: "xlsx",
		type: "array",
	});

	return new Blob([workbookBuffer], { type: EXCEL_MIME_TYPE });
}
