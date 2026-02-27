import { format, isValid, parseISO } from "date-fns";
import * as XLSX from "xlsx";
import type { InvoiceExportLineResult } from "@/core/types/invoice";

const EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type TemplateColumn = {
	label: string;
	width: number;
	map: (row: InvoiceExportLineResult, index: number) => string | number | null;
};

const TEMPLATE_COLUMNS: TemplateColumn[] = [
	{ label: "NO", width: 8, map: (_row, index) => index + 1 },
	{ label: "REF NO", width: 18, map: (row) => row.refNo ?? "" },
	{ label: "CUSTOMER", width: 24, map: (row) => row.customerName ?? "" },
	{ label: "DATE", width: 14, map: (row) => formatReportDate(row.date) },
	{ label: "PRODUCT NAME", width: 28, map: (row) => row.productName ?? "" },
	{ label: "UNIT", width: 12, map: (row) => row.unit ?? "" },
	{ label: "PRICE", width: 14, map: (row) => row.pricePerProduct ?? null },
	{ label: "QTY / PRODUCT", width: 16, map: (row) => row.quantityPerProduct ?? null },
	{ label: "QTY", width: 12, map: (row) => row.quantity ?? null },
	{ label: "AMOUNT", width: 16, map: (row) => row.amount ?? null },
	{ label: "TOTAL", width: 16, map: (row) => row.total ?? null },
	{ label: "RECEIVED", width: 16, map: (row) => row.paid ?? null },
	{ label: "BALANCE", width: 16, map: (row) => row.balance ?? null },
	{ label: "MEMO", width: 30, map: (row) => row.memo ?? "" },
];

function formatReportDate(value?: string): string {
	if (!value) return "";
	const parsed = parseISO(value);
	if (!isValid(parsed)) return value;
	return format(parsed, "dd/MM/yyyy");
}

export function buildInvoiceExportBlob(rows: InvoiceExportLineResult[]): Blob {
	const headerRow = TEMPLATE_COLUMNS.map((column) => column.label);
	const dataRows = rows.map((row, index) => TEMPLATE_COLUMNS.map((column) => column.map(row, index)));
	const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
	worksheet["!cols"] = TEMPLATE_COLUMNS.map((column) => ({ wch: column.width }));

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice Export");

	const workbookBuffer = XLSX.write(workbook, {
		bookType: "xlsx",
		type: "array",
	});

	return new Blob([workbookBuffer], { type: EXCEL_MIME_TYPE });
}
