import type { ColumnDef } from "@tanstack/react-table";
import type { InventoryItem } from "@/core/types/inventory";
import { Badge } from "@/core/ui/badge";

export type ItemRow = {
	id: string;
	code: string;
	name: string;
	type: string;
	unit: string;
	quantityOnHand: number;
	alertThreshold: number;
};

export function mapItemsToRows(items: InventoryItem[]): ItemRow[] {
	return items.map((item) => ({
		id: item.id,
		code: item.code,
		name: item.name,
		type: item.type,
		unit: item.unit?.name ?? "-",
		quantityOnHand: item.quantityOnHand,
		alertThreshold: item.alertThreshold,
	}));
}

export function filterItemRows(
	rows: ItemRow[],
	typeFilter: string,
	fieldFilter: string,
	searchValue: string,
): ItemRow[] {
	const normalized = searchValue.trim().toLowerCase();
	return rows.filter((row) => {
		if (typeFilter !== "all") {
			if (row.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
		}

		if (!normalized) return true;

		if (fieldFilter === "name") return row.name.toLowerCase().includes(normalized);
		if (fieldFilter === "code") return row.code.toLowerCase().includes(normalized);

		return row.name.toLowerCase().includes(normalized) || row.code.toLowerCase().includes(normalized);
	});
}

export function paginateItemRows(
	rows: ItemRow[],
	page: number,
	pageSize: number,
): {
	pagedRows: ItemRow[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
} {
	const totalItems = rows.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return {
		pagedRows: rows.slice(start, start + pageSize),
		totalItems,
		totalPages,
		currentPage,
	};
}

export function itemColumns(): ColumnDef<ItemRow>[] {
	return [
		{ accessorKey: "code", header: "Code" },
		{ accessorKey: "name", header: "Name" },
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant={row.original.type === "CONSUMABLE" ? "info" : "destructive"} className="w-4/5">
					{row.original.type}
				</Badge>
			),
			meta: {
				bodyClassName: "text-center",
			},
		},
		{
			id: "stockStatus",
			header: "Status",
			cell: ({ row }) => {
				const isLowStock = row.original.quantityOnHand <= row.original.alertThreshold;
				return <Badge variant={isLowStock ? "warning" : "success"}>{isLowStock ? "LOW STOCK" : "NORMAL"}</Badge>;
			},
			meta: {
				bodyClassName: "text-center",
			},
		},
		{ accessorKey: "unit", header: "Unit" },
		{ accessorKey: "quantityOnHand", header: "On Hand", meta: { bodyClassName: "text-right" } },
		{
			accessorKey: "alertThreshold",
			header: "Alert Threshold",
			cell: ({ row }) => row.original.alertThreshold ?? "-",
			meta: { bodyClassName: "text-right" },
		},
	];
}
