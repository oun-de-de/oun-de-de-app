import type { ColumnDef } from "@tanstack/react-table";
import type { Customer } from "@/core/types/customer";
import { Badge } from "@/core/ui/badge";
import { getStatusVariant } from "@/core/utils/get-status-variant";
import { CustomerActions } from "./customer-actions";

export const columns: ColumnDef<Customer>[] = [
	{
		header: "Code",
		accessorKey: "code",
		size: 100,
		meta: { bodyClassName: "text-center" },
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
		header: "Customer Type",
		accessorKey: "referredBy",
	},
	{
		header: "Price Level",
		accessorKey: "defaultPrice",
		size: 100,
		cell: ({ row }) => {
			return <span className="font-medium text-sky-600">{row.original.defaultPrice}</span>;
		},
		meta: { bodyClassName: "text-center" },
	},
	{
		header: "Status",
		accessorKey: "status",
		size: 80,
		meta: { bodyClassName: "text-center" },
		cell: ({ row }) => {
			const status = row.original.status ? "Active" : "Inactive";
			const variant = getStatusVariant(status);
			return <Badge variant={variant}>{status}</Badge>;
		},
	},
	{
		header: "Actions",
		size: 80,
		id: "actions",
		cell: ({ row }) => <CustomerActions customerId={row.original.id} />,
	},
];
