import type { ReportTemplateColumn } from "@/pages/dashboard/reports/components/layout/report-template-table";

export const PREVIEW_COLUMNS: ReportTemplateColumn[] = [
	{ id: "date", accessorFn: (row) => row.cells.date, header: "Date", meta: { align: "left" } },
	{ id: "type", accessorFn: (row) => row.cells.type, header: "Type", meta: { align: "center" } },
	{ id: "reason", accessorFn: (row) => row.cells.reason, header: "Reason", meta: { align: "left" } },
	{ id: "quantity", accessorFn: (row) => row.cells.quantity, header: "Quantity", meta: { align: "right" } },
	{ id: "expense", accessorFn: (row) => row.cells.expense, header: "Expense", meta: { align: "right" } },
	{ id: "memo", accessorFn: (row) => row.cells.memo, header: "Memo", meta: { align: "left" } },
];
