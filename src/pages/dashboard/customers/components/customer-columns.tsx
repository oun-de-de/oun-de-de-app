import type { ColumnDef } from "@tanstack/react-table";
import type { Customer } from "@/core/types/customer";
import { Badge } from "@/core/ui/badge";
import { formatDisplayDate } from "@/core/utils/formatters";
import { getStatusVariant } from "@/core/utils/get-status-variant";
import { CustomerActions } from "./customer-actions";

export const columns: ColumnDef<Customer>[] = [
	{
		header: "Register Date",
		size: 100,
		accessorKey: "registerDate",
		cell: ({ row }) => formatDisplayDate(row.original.registerDate),
		meta: { bodyClassName: "text-center" },
	},
	{
		header: "Code",
		accessorKey: "code",
		size: 120,
		meta: { bodyClassName: "text-center" },
		cell: ({ row }) => <span className="font-medium text-sky-600">{row.original.code}</span>,
	},
	{
		header: "Name",
		accessorKey: "name",
	},
	{
		header: "Phone",
		size: 100,
		accessorKey: "telephone",
	},
	{
		header: "Customer Type",
		accessorKey: "referredBy",
	},
	// {
	// 	header: "Price Level",
	// 	accessorKey: "defaultPrice",
	// 	size: 100,
	// 	cell: ({ row }) => {
	// 		const value = row.original.defaultPrice;
	// 		return (
	// 			<Badge variant={getDefaultPriceVariant(value)} className="w-full">
	// 				{getDefaultPriceLabel(value)}
	// 			</Badge>
	// 		);
	// 	},
	// 	meta: { bodyClassName: "text-center" },
	// },
	{
		header: "Status",
		accessorKey: "status",
		size: 80,
		meta: { bodyClassName: "text-center" },
		cell: ({ row }) => {
			const status = row.original.status ? "Active" : "Inactive";
			const variant = getStatusVariant(status);
			return (
				<Badge variant={variant} className="w-full">
					{status}
				</Badge>
			);
		},
	},
	{
		header: "Actions",
		id: "actions",
		size: 200,
		cell: ({ row }) => <CustomerActions customerId={row.original.id} customerName={row.original.name} />,
	},
];
