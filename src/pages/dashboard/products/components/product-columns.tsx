import type { ColumnDef } from "@tanstack/react-table";
import Icon from "@/core/components/icon/icon";
import type { Product } from "@/core/types/product";
import { Button } from "@/core/ui/button";

export const columns: ColumnDef<Product>[] = [
	{
		header: "Date",
		size: 80,
		accessorKey: "date",
		cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
	},
	{
		header: "Ref No",
		accessorKey: "refNo",
		cell: ({ row }) => <span className="text-sky-600">{row.original.refNo}</span>,
	},
	{
		header: "Name",
		accessorKey: "name",
	},
	{
		header: "Quantity",
		size: 60,
		accessorKey: "quantity",
		meta: { bodyClassName: "text-right" },
	},
	{
		header: "Cost",
		size: 60,
		accessorKey: "cost",
		cell: ({ row }) => (row.original.cost || 0).toLocaleString(),
		meta: { bodyClassName: "text-right" },
	},
	{
		header: "Price",
		size: 60,
		accessorKey: "price",
		cell: ({ row }) => <span className="font-semibold">{(row.original.price || 0).toLocaleString()}</span>,
		meta: { bodyClassName: "text-right" },
	},
	{
		header: "Actions",
		size: 80,
		id: "actions",
		cell: () => (
			<div className="flex gap-1">
				<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
					<Icon icon="mdi:pencil" />
				</Button>
				<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
					<Icon icon="mdi:delete" />
				</Button>
			</div>
		),
	},
];
