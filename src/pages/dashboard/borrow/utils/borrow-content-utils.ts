import type { SummaryStatCardData } from "@/core/types/common";
import type { Loan } from "@/core/types/loan";
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

const SEARCH_SELECTOR: Record<BorrowFieldFilter, (row: Loan) => string> = {
	borrowerId: (row) => row.borrowerId,
	borrowerType: (row) => row.borrowerType,
};

const isBorrowTypeFilter = (value: string): value is BorrowTypeFilter =>
	value === "all" || value === "employee" || value === "customer";

const isBorrowFieldFilter = (value: string): value is BorrowFieldFilter =>
	value === "borrowerId" || value === "borrowerType";

export function filterLoans(loans: Loan[], state: Pick<BorrowState, "searchValue" | "fieldFilter" | "typeFilter">) {
	const normalizedQuery = state.searchValue.trim().toLowerCase();
	const selectSearchField = SEARCH_SELECTOR[state.fieldFilter] ?? SEARCH_SELECTOR.borrowerId;
	const matchesType = (row: Loan) => state.typeFilter === "all" || row.borrowerType === state.typeFilter;
	const matchesSearch = (row: Loan) =>
		normalizedQuery === "" || selectSearchField(row).toLowerCase().includes(normalizedQuery);

	return loans.filter((row) => matchesType(row) && matchesSearch(row));
}

export function buildLoanSummaryCards(loans: Loan[]): SummaryStatCardData[] {
	const totalLoans = loans.length;
	const employeeCount = loans.filter((row) => row.borrowerType === "employee").length;
	const customerCount = loans.filter((row) => row.borrowerType === "customer").length;
	const totalPrincipal = loans.reduce((sum, row) => sum + row.principalAmount, 0);

	return [
		{ label: "Total Loans", value: totalLoans, color: "bg-blue-500", icon: "mdi:cash-multiple" },
		{ label: "Employee Loans", value: employeeCount, color: "bg-indigo-500", icon: "mdi:account-tie" },
		{ label: "Customer Loans", value: customerCount, color: "bg-emerald-500", icon: "mdi:account-group" },
		{ label: "Total Principal", value: totalPrincipal, color: "bg-orange-500", icon: "mdi:currency-usd" },
	];
}

export function paginateLoans(loans: Loan[], page: number, pageSize: number) {
	const totalItems = loans.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const start = (page - 1) * pageSize;
	const paginatedLoans = loans.slice(start, start + pageSize);
	const paginationItems = Array.from({ length: totalPages }, (_, index) => index + 1);

	return { totalItems, totalPages, paginatedLoans, paginationItems };
}

export function buildLoanViewActions({
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
	const isRequestsView = activeView === "requests";

	return {
		mainAction: {
			label: isRequestsView ? "All Loans" : "Requests",
			onClick: isRequestsView ? openAllLoans : openRequests,
		},
		options: isRequestsView
			? [{ label: "Requests", onClick: openRequests }]
			: [{ label: "All Loans", onClick: openAllLoans }],
		newBorrowMainAction: {
			label: "New Loan",
			onClick: () => navigate("/dashboard/borrow/payment"),
		},
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
