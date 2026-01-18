import type { ColumnDef } from "@tanstack/react-table";
import type { ProductRow } from "@/core/types/common";

export const columns: ColumnDef<ProductRow>[] = [
	{
		header: "Date",
		accessorKey: "date",
	},
	{
		header: "Ref No",
		accessorKey: "refNo",
		cell: ({ row }) => <span className="text-sky-600">{row.original.refNo}</span>,
	},
	{
		header: "Type",
		cell: ({ row }) => (
			<span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">{row.original.type}</span>
		),
	},
	{
		header: "Status",
		cell: ({ row }) => (
			<span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{row.original.status}</span>
		),
	},
	{
		header: "Qty",
		accessorKey: "qty",
	},
	{
		header: "Cost",
		cell: ({ row }) => row.original.cost.toLocaleString(),
	},
	{
		header: "Price",
		cell: ({ row }) => <span className="font-semibold">{row.original.price.toLocaleString()}</span>,
	},
];
