import type { ColumnDef } from "@tanstack/react-table";
import type { InventoryItem } from "@/core/types/inventory";
import { Button } from "@/core/ui/button";

export const getBorrowCreateColumns = (onAddToCart: (item: InventoryItem) => void): ColumnDef<InventoryItem>[] => [
	{ accessorKey: "code", header: "Code" },
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ getValue }) => (
			<span className="font-semibold text-blue-600 hover:underline cursor-pointer">{getValue() as string}</span>
		),
	},
	{ accessorKey: "type", header: "Type" },
	{
		accessorKey: "quantityOnHand",
		header: "Stock",
		cell: ({ getValue }) => <span className="text-gray-600">{getValue() as number}</span>,
		meta: {
			bodyClassName: "text-right",
		},
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<Button
				type="button"
				size="sm"
				onClick={() => onAddToCart(row.original)}
				className="h-6 px-4 text-[11px] uppercase font-bold bg-blue-500 hover:bg-blue-600 text-white tracking-wide rounded-sm shadow-sm"
			>
				Select
			</Button>
		),
		meta: {
			bodyClassName: "text-center",
		},
	},
];
