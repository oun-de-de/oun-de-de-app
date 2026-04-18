import { SmartDataTable } from "@/core/components/common";
import { useCallback, useMemo } from "react";
import type { Customer } from "@/core/types/customer";
import { Text } from "@/core/ui/typography";
import { useLocation, useNavigate } from "react-router";
import type { ListState } from "../stores/customer-list-store";
import { FILTER_FIELD_OPTIONS, FILTER_TYPE_OPTIONS } from "../utils/customer-utils";
import CustomerButtonActions from "./customer-button-actions";
import { columns } from "./customer-columns";

type CustomerContentProps = {
	activeCustomer: Customer | null;
	listState: ListState;
	updateState: (state: Partial<ListState>) => void;
	pagedData: Customer[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
	isLoading?: boolean;
};

export function CustomerContent({
	activeCustomer,
	listState,
	updateState,
	pagedData,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
}: CustomerContentProps) {
	const navigate = useNavigate();
	const location = useLocation();
	// const summaryStats = getSummaryStats(activeCustomer);
	const searchPlaceholder = listState.fieldFilter === "payment_term" ? "Enter payment term in days" : "Search...";
	const returnTo = `${location.pathname}${location.search}`;
	const handleRowClick = useCallback(
		(customer: Customer) => navigate(`/dashboard/customers/edit/${customer.id}`, { state: { returnTo } }),
		[navigate, returnTo],
	);
	const handleTypeChange = useCallback((value: string) => updateState({ typeFilter: value, page: 1 }), [updateState]);
	const handleFieldChange = useCallback((value: string) => updateState({ fieldFilter: value, page: 1 }), [updateState]);
	const handleSearchChange = useCallback(
		(value: string) => updateState({ searchValue: value, page: 1 }),
		[updateState],
	);
	const handlePageChange = useCallback((nextPage: number) => updateState({ page: nextPage }), [updateState]);
	const handlePageSizeChange = useCallback(
		(nextSize: number) => updateState({ pageSize: nextSize, page: 1 }),
		[updateState],
	);
	const filterConfig = useMemo(
		() => ({
			showTypeFilter: false,
			typeOptions: FILTER_TYPE_OPTIONS,
			fieldOptions: FILTER_FIELD_OPTIONS,
			typeValue: listState.typeFilter,
			fieldValue: listState.fieldFilter,
			searchValue: listState.searchValue,
			searchPlaceholder,
			onTypeChange: handleTypeChange,
			onFieldChange: handleFieldChange,
			onSearchChange: handleSearchChange,
		}),
		[
			handleFieldChange,
			handleSearchChange,
			handleTypeChange,
			listState.fieldFilter,
			listState.searchValue,
			listState.typeFilter,
			searchPlaceholder,
		],
	);
	const paginationConfig = useMemo(
		() => ({
			page: currentPage,
			pageSize: listState.pageSize,
			totalItems,
			totalPages,
			paginationItems,
			onPageChange: handlePageChange,
			onPageSizeChange: handlePageSizeChange,
		}),
		[currentPage, handlePageChange, handlePageSizeChange, listState.pageSize, paginationItems, totalItems, totalPages],
	);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
				<div className="flex items-center gap-2">
					{/* <Button size="sm" className="gap-1">
						<Icon icon="mdi:account-multiple-outline" />
						Customer
					</Button> */}
					<Text variant="body2" className="text-slate-400">
						{activeCustomer ? `${activeCustomer.name} selected` : "No Customer Selected"}
					</Text>
				</div>
				<CustomerButtonActions />
			</div>
			{/* <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{summaryStats.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div> */}

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedData}
				columns={columns}
				onRowClick={handleRowClick}
				filterConfig={filterConfig}
				paginationConfig={paginationConfig}
			/>
		</>
	);
}
