import type { SummaryStatCardData } from "@/core/types/common";
import type { BorrowRow } from "../components/borrow-columns";
import type { BorrowFieldFilter, BorrowState, BorrowTypeFilter } from "../stores/borrow-state";

export const BORROW_TYPE_OPTIONS = [
	{ label: "All Type", value: "all" },
	{ label: "Employee", value: "employee" },
	{ label: "Customer", value: "customer" },
];

export const BORROW_FIELD_OPTIONS = [
	{ label: "Borrower ID", value: "borrowerId" },
	{ label: "Type", value: "borrowerType" },
];

const SEARCH_SELECTOR: Record<BorrowFieldFilter, (row: BorrowRow) => string> = {
	borrowerId: (row) => row.borrowerId,
	borrowerType: (row) => row.borrowerType,
};

const isBorrowTypeFilter = (value: string): value is BorrowTypeFilter =>
	value === "all" || value === "employee" || value === "customer";

const isBorrowFieldFilter = (value: string): value is BorrowFieldFilter =>
	value === "borrowerId" || value === "borrowerType";

export function filterBorrowRows(
	rows: BorrowRow[],
	state: Pick<BorrowState, "searchValue" | "fieldFilter" | "typeFilter">,
) {
	const normalizedQuery = state.searchValue.trim().toLowerCase();
	const selectSearchField = SEARCH_SELECTOR[state.fieldFilter] ?? SEARCH_SELECTOR.borrowerId;
	const matchesType = (row: BorrowRow) => state.typeFilter === "all" || row.borrowerType === state.typeFilter;
	const matchesSearch = (row: BorrowRow) =>
		normalizedQuery === "" || selectSearchField(row).toLowerCase().includes(normalizedQuery);

	return rows.filter((row) => matchesType(row) && matchesSearch(row));
}

export function buildBorrowSummaryCards(rows: BorrowRow[]): SummaryStatCardData[] {
	const totalLoans = rows.length;
	const employeeCount = rows.filter((row) => row.borrowerType === "employee").length;
	const customerCount = rows.filter((row) => row.borrowerType === "customer").length;
	const totalPrincipal = rows.reduce((sum, row) => sum + row.principalAmount, 0);

	return [
		{ label: "Total Loans", value: totalLoans, color: "bg-blue-500", icon: "mdi:cash-multiple" },
		{ label: "Employee Loans", value: employeeCount, color: "bg-indigo-500", icon: "mdi:account-tie" },
		{ label: "Customer Loans", value: customerCount, color: "bg-emerald-500", icon: "mdi:account-group" },
		{ label: "Total Principal", value: totalPrincipal, color: "bg-orange-500", icon: "mdi:currency-usd" },
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
			fieldValue: state.fieldFilter || "borrowerId",
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
