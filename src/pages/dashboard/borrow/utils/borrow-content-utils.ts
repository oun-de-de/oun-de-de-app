import type { SummaryStatCardData } from "@/core/types/common";
import type { BorrowRow } from "../components/borrow-columns";
import type { BorrowFieldFilter, BorrowState, BorrowTypeFilter } from "../stores/borrow-state";

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

const SEARCH_SELECTOR: Record<BorrowFieldFilter, (row: BorrowRow) => string> = {
	borrower: (row) => row.borrower,
	borrowerType: (row) => row.borrowerType,
	refNo: (row) => row.refNo,
};

const isBorrowTypeFilter = (value: string): value is BorrowTypeFilter =>
	value === "all" || value === "Active" || value === "Returned" || value === "Overdue";

const isBorrowFieldFilter = (value: string): value is BorrowFieldFilter =>
	value === "refNo" || value === "borrower" || value === "borrowerType";

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

export function buildBorrowViewActions({
	activeView,
	updateState,
	navigate,
}: {
	activeView: BorrowState["activeView"];
	updateState: (updates: Partial<Omit<BorrowState, "type">>) => void;
	navigate: (path: string) => void;
}) {
	const openAllLoans = () => updateState({ activeView: "all", page: 1 });
	const openRequests = () => updateState({ activeView: "requests", page: 1 });

	return {
		mainAction: {
			label: activeView === "requests" ? "Requests" : "All Loans",
			onClick: activeView === "requests" ? openRequests : openAllLoans,
		},
		options: [
			{ label: "All Loans", onClick: openAllLoans },
			{ label: "Requests", onClick: openRequests },
		],
		newBorrowMainAction: {
			label: "New Loan",
			onClick: () => navigate("/dashboard/borrow/new"),
		},
		newBorrowOptions: [
			{ label: "Record Monthly Payment", onClick: () => navigate("/dashboard/borrow/payment") },
			{ label: "Adjust Schedule", onClick: openRequests },
		],
	};
}

export function buildBorrowTableConfigs({
	state,
	totalItems,
	totalPages,
	paginationItems,
	updateState,
}: {
	state: BorrowState;
	totalItems: number;
	totalPages: number;
	paginationItems: Array<number | "...">;
	updateState: (updates: Partial<Omit<BorrowState, "type">>) => void;
}) {
	return {
		filterConfig: {
			typeOptions: BORROW_TYPE_OPTIONS,
			fieldOptions: BORROW_FIELD_OPTIONS,
			typeValue: state.typeFilter,
			fieldValue: state.fieldFilter || "refNo",
			searchValue: state.searchValue,
			onTypeChange: (value: string) => {
				if (!isBorrowTypeFilter(value)) return;
				updateState({ typeFilter: value, page: 1 });
			},
			onFieldChange: (value: string) => {
				if (!isBorrowFieldFilter(value)) return;
				updateState({ fieldFilter: value, page: 1 });
			},
			onSearchChange: (v: string) => updateState({ searchValue: v, page: 1 }),
		},
		paginationConfig: {
			page: state.page,
			pageSize: state.pageSize,
			totalItems,
			totalPages,
			onPageChange: (p: number) => updateState({ page: p }),
			onPageSizeChange: (s: number) => updateState({ pageSize: s, page: 1 }),
			paginationItems,
		},
	};
}
