import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import type { Product } from "@/core/types/product";
import { Button } from "@/core/ui/button";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";

export const columns: ColumnDef<Product>[] = [
	{
		header: "Date",
		size: 80,
		accessorKey: "date",
		cell: ({ row }) => formatDisplayDate(row.original.date),
	},
	{
		header: "Name",
		accessorKey: "name",
	},
	{
		header: "Unit",
		size: 80,
		id: "unit",
		cell: ({ row }) => row.original.unit?.name || "-",
	},
	{
		header: "Default Qty",
		size: 90,
		id: "defaultQuantity",
		cell: ({ row }) =>
			row.original.defaultProductSetting?.quantity !== null &&
			row.original.defaultProductSetting?.quantity !== undefined
				? row.original.defaultProductSetting.quantity
				: "-",
		meta: { bodyClassName: "text-right" },
	},
	{
		header: "Default Price",
		size: 100,
		id: "defaultPrice",
		cell: ({ row }) => formatNumber(row.original.defaultProductSetting?.price, "-"),
		meta: { bodyClassName: "text-right" },
	},
	{
		header: "Actions",
		size: 80,
		id: "actions",
		cell: ({ row }) => {
			const navigate = useNavigate();
			return (
				<div className="flex gap-1">
					<Button variant="warning" size="sm" onClick={() => navigate(`/dashboard/products/edit/${row.original.id}`)}>
						Edit
					</Button>
				</div>
			);
		},
	},
];
