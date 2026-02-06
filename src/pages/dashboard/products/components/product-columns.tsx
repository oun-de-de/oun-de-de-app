import type { ColumnDef } from "@tanstack/react-table";
import Icon from "@/core/components/icon/icon";
import type { Product } from "@/core/types/product";
import { Button } from "@/core/ui/button";

export const columns: ColumnDef<Product>[] = [
	{
		header: "Date",
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
		accessorKey: "quantity",
	},
	{
		header: "Cost",
		accessorKey: "cost",
		cell: ({ row }) => (row.original.cost || 0).toLocaleString(),
	},
	{
		header: "Price",
		accessorKey: "price",
		cell: ({ row }) => <span className="font-semibold">{(row.original.price || 0).toLocaleString()}</span>,
	},
	{
		header: "Actions",
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
