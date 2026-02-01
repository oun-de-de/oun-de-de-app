import type { ColumnDef } from "@tanstack/react-table";
import type { Customer } from "@/core/types/customer";
import { Badge } from "@/core/ui/badge";
import { getStatusVariant } from "@/core/utils/get-status-variant";

export const columns: ColumnDef<Customer>[] = [
	{
		header: "Code",
		accessorKey: "code",
		cell: ({ row }) => <span className="font-medium text-sky-600">{row.original.code}</span>,
	},
	{
		header: "Name",
		accessorKey: "name",
	},
	{
		header: "Phone",
		accessorKey: "telephone",
	},
	{
		header: "Type",
		accessorKey: "customerType",
		cell: ({ row }) => (
			<span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">{row.original.customerType}</span>
		),
	},
	{
		header: "Price Level",
		accessorKey: "defaultPrice",
	},
	{
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => {
			const status = row.original.status ? "Active" : "Inactive";
			const variant = getStatusVariant(status);
			return <Badge variant={variant}>{status}</Badge>;
		},
	},
];
