import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/core/ui/button";
import type { CartItem } from "@/pages/dashboard/borrow/stores/borrow-cart-store";

export const getBorrowPaymentColumns = (onRemove: (id: string) => void): ColumnDef<CartItem>[] => [
	{
		id: "index",
		header: "#",
		cell: ({ row }) => <span className="text-gray-400 text-xs">{row.index + 1}</span>,
		size: 50,
	},
	{
		accessorKey: "name",
		header: "Item Details",
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span className="text-gray-900 font-medium">{row.original.name}</span>
				<span className="text-gray-400 text-xs">{row.original.code}</span>
			</div>
		),
	},
	{
		accessorKey: "qty",
		header: "Qty",
		cell: ({ getValue }) => (
			<div className="flex justify-center">
				<span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs">{getValue() as number}</span>
			</div>
		),
		size: 80,
	},
	{
		accessorKey: "price",
		header: "Price",
		cell: ({ getValue }) => <div className="text-right text-gray-500">${getValue() as number}</div>,
		size: 100,
	},
	{
		id: "total",
		header: "Total",
		cell: ({ row }) => (
			<div className="text-right font-bold text-gray-900">${(row.original.price * row.original.qty).toFixed(2)}</div>
		),
		size: 100,
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<div className="flex justify-end">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onRemove(row.original.id)}
					className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-transparent"
				>
					<Trash2 className="w-4 h-4" />
				</Button>
			</div>
		),
		size: 50,
	},
];
