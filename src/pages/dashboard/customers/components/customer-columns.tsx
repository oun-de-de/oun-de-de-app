import type { TransactionRow } from "@/core/types/common";
import { fNumber } from "@/utils/format-number";
import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<TransactionRow>[] = [
	{
		header: "Date",
		accessorKey: "date",
		meta: { className: "text-gray-600" },
	},
	{
		header: "Ref No",
		accessorKey: "refNo",
		meta: { className: "text-sky-600" },
	},
	{
		header: "Customer",
		accessorKey: "customer",
	},
	{
		header: "Type",
		cell: ({ row }) => (
			<span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">{row.original.type}</span>
		),
	},
	{
		header: "Ref Type",
		cell: ({ row }) => (
			<span className="rounded-md border px-2 py-0.5 text-xs text-gray-600">{row.original.refType}</span>
		),
	},
	{
		header: "Status",
		cell: ({ row }) => (
			<span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{row.original.status}</span>
		),
	},
	{
		header: "Amount",
		cell: ({ row }) => <span className="font-semibold">{fNumber(row.original.amount)} KHR</span>,
		meta: { className: "text-right" },
	},
	{
		header: "Memo",
		accessorKey: "memo",
		meta: { className: "text-gray-600" },
	},
];
