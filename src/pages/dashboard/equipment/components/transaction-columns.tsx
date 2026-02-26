import type { ColumnDef } from "@tanstack/react-table";
import type { InventoryTransaction } from "@/core/types/inventory";
import { Badge } from "@/core/ui/badge";
import { formatDateTime } from "../utils/utils";

export type TransactionRow = {
	id: string;
	date: string;
	type: string;
	reason: string;
	quantity: number;
	memo: string;
};

export function mapTransactionsToRows(transactions: InventoryTransaction[]): TransactionRow[] {
	return transactions.map((tx) => ({
		id: tx.id,
		date: formatDateTime(tx.createdAt),
		type: tx.type,
		reason: tx.reason,
		quantity: tx.quantity,
		memo: tx.memo ?? "-",
	}));
}

export function filterRows(
	rows: TransactionRow[],
	typeFilter: string,
	fieldFilter: string,
	searchValue: string,
): TransactionRow[] {
	const normalized = searchValue.trim().toLowerCase();
	return rows.filter((row) => {
		if (typeFilter !== "all") {
			if (row.type !== typeFilter) return false;
		}

		if (!normalized) return true;

		if (fieldFilter === "reason") return row.reason.toLowerCase().includes(normalized);
		if (fieldFilter === "memo") return row.memo.toLowerCase().includes(normalized);

		return (
			row.type.toLowerCase().includes(normalized) ||
			row.reason.toLowerCase().includes(normalized) ||
			row.memo.toLowerCase().includes(normalized)
		);
	});
}

export function paginateRows(
	rows: TransactionRow[],
	page: number,
	pageSize: number,
): {
	pagedRows: TransactionRow[];
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

export function transactionColumns(): ColumnDef<TransactionRow>[] {
	return [
		{ accessorKey: "date", header: "Date" },
		{
			accessorKey: "type",
			header: "Type",
			size: 80,
			cell: ({ row }) => <Badge variant={row.original.type === "IN" ? "info" : "error"} shape="square">{row.original.type}</Badge>,
			meta: {
				bodyClassName: "text-center",
			}
		},
		{ accessorKey: "reason", header: "Reason" },
		{ accessorKey: "quantity", header: "Quantity", meta: { bodyClassName: "text-right" } },
		{ accessorKey: "memo", header: "Memo" },
	];
}
