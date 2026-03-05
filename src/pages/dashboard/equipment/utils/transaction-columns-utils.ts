import type { InventoryTransaction } from "@/core/types/inventory";
import { formatDateTime, formatKHR } from "@/core/utils/formatters";

export type TransactionRow = {
	id: string;
	date: string;
	type: string;
	reason: string;
	quantity: number;
	expense?: number;
	memo: string;
};

const TYPE_FILTER_ALL = "all";
const SEARCHABLE_FIELDS = ["type", "reason", "memo"] as const;

function getSearchValue(value: string) {
	return value.trim().toLowerCase();
}

function shouldSkipType(typeFilter: string, rowType: string) {
	return typeFilter !== TYPE_FILTER_ALL && rowType !== typeFilter;
}

function includesIgnoreCase(value: string, keyword: string) {
	return value.toLowerCase().includes(keyword);
}

function filterRowByField(row: TransactionRow, fieldFilter: string, normalized: string) {
	switch (fieldFilter) {
		case "reason":
			return includesIgnoreCase(row.reason, normalized);
		case "memo":
			return includesIgnoreCase(row.memo, normalized);
		default:
			return SEARCHABLE_FIELDS.some((field) => includesIgnoreCase(row[field], normalized));
	}
}

export function mapTransactionsToRows(transactions: InventoryTransaction[]): TransactionRow[] {
	return transactions.map((tx) => ({
		id: tx.id,
		date: formatDateTime(tx.createdAt),
		type: tx.type,
		reason: tx.reason,
		quantity: tx.quantity,
		expense: tx.expense,
		memo: tx.memo ?? "-",
	}));
}

export function filterRows(
	rows: TransactionRow[],
	typeFilter: string,
	fieldFilter: string,
	searchValue: string,
): TransactionRow[] {
	const normalized = getSearchValue(searchValue);
	return rows.filter((row) => {
		if (shouldSkipType(typeFilter, row.type)) return false;

		if (!normalized) return true;
		return filterRowByField(row, fieldFilter, normalized);
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

export function getExpenseText(expense?: number) {
	if (!expense || expense <= 0) {
		return "-";
	}
	return formatKHR(expense);
}
