import type { ReportTemplateColumn } from "@/pages/dashboard/reports/components/layout/report-template-table";

export const EXPORT_PREVIEW_COLUMNS: ReportTemplateColumn[] = [
	{ id: "no", header: "NO", cell: ({ row }) => row.original.cells.no },
	{ id: "refNo", header: "REF NO", cell: ({ row }) => row.original.cells.refNo, meta: { align: "left" } },
	{ id: "customer", header: "CUSTOMER", cell: ({ row }) => row.original.cells.customer, meta: { align: "left" } },
	{ id: "date", header: "DATE", cell: ({ row }) => row.original.cells.date },
	{
		id: "productName",
		header: "PRODUCT NAME",
		cell: ({ row }) => row.original.cells.productName,
		meta: { align: "left" },
	},
	{ id: "unit", header: "UNIT", cell: ({ row }) => row.original.cells.unit },
	{ id: "price", header: "PRICE", cell: ({ row }) => row.original.cells.price, meta: { align: "right" } },
	{ id: "quantity", header: "QTY", cell: ({ row }) => row.original.cells.quantity, meta: { align: "right" } },
	{ id: "amount", header: "AMOUNT", cell: ({ row }) => row.original.cells.amount, meta: { align: "right" } },
	{ id: "total", header: "TOTAL", cell: ({ row }) => row.original.cells.total, meta: { align: "right" } },
	{ id: "received", header: "RECEIVED", cell: ({ row }) => row.original.cells.received, meta: { align: "right" } },
	{ id: "balance", header: "BALANCE", cell: ({ row }) => row.original.cells.balance, meta: { align: "right" } },
	{ id: "memo", header: "MEMO", cell: ({ row }) => row.original.cells.memo, meta: { align: "left" } },
];
