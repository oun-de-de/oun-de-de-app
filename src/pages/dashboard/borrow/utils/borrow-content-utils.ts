import type { SummaryStatCardData } from "@/core/types/common";
import type { BorrowRow } from "../components/borrow-columns";
import type { BorrowState } from "../stores/borrow-state";

export const BORROW_TYPE_OPTIONS = [
	{ label: "All Status", value: "all" },
	{ label: "Active", value: "Active" },
	{ label: "Returned", value: "Returned" },
	{ label: "Overdue", value: "Overdue" },
];

export const BORROW_FIELD_OPTIONS = [
	{ label: "Ref No", value: "refNo" },
	{ label: "Borrower", value: "borrower" },
	{ label: "Type", value: "borrowerType" },
];

const SEARCH_SELECTOR: Record<string, (row: BorrowRow) => string> = {
	borrower: (row) => row.borrower,
	borrowerType: (row) => row.borrowerType,
	refNo: (row) => row.refNo,
};

export function filterBorrowRows(
	rows: BorrowRow[],
	state: Pick<BorrowState, "searchValue" | "fieldFilter" | "typeFilter">,
) {
	const normalizedQuery = state.searchValue.trim().toLowerCase();
	const selectSearchField = SEARCH_SELECTOR[state.fieldFilter] ?? SEARCH_SELECTOR.refNo;
	const matchesType = (row: BorrowRow) => state.typeFilter === "all" || row.status === state.typeFilter;
	const matchesSearch = (row: BorrowRow) =>
		normalizedQuery === "" || selectSearchField(row).toLowerCase().includes(normalizedQuery);

	return rows.filter((row) => matchesType(row) && matchesSearch(row));
}

export function buildBorrowSummaryCards(rows: BorrowRow[]): SummaryStatCardData[] {
	const activeCount = rows.filter((row) => row.status === "Active").length;
	const overdueCount = rows.filter((row) => row.status === "Overdue").length;
	const closedCount = rows.filter((row) => row.status === "Returned").length;

	return [
		{ label: "Active Loans", value: activeCount, color: "bg-blue-500", icon: "mdi:cash-multiple" },
		{ label: "Overdue Loans", value: overdueCount, color: "bg-red-500", icon: "mdi:alert-circle-outline" },
		{ label: "Closed Loans", value: closedCount, color: "bg-emerald-500", icon: "mdi:check-circle-outline" },
	];
}

export function paginateBorrowRows(rows: BorrowRow[], page: number, pageSize: number) {
	const totalItems = rows.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const start = (page - 1) * pageSize;
	const paginatedRows = rows.slice(start, start + pageSize);
	const paginationItems = Array.from({ length: totalPages }, (_, index) => index + 1);

	return { totalItems, totalPages, paginatedRows, paginationItems };
}
