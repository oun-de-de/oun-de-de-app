import { useEffect, useMemo, useState } from "react";
import { customerTransactions } from "@/_mock/data/dashboard";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { useCustomersList, useCustomersListActions } from "@/core/store/customersListStore";
import { buildPagination, normalizeToken } from "@/core/utils/dashboard-utils";
import { CustomerContent } from "./components/customer-content";
import { CustomerSidebar } from "./components/customer-sidebar";

const transactions = customerTransactions;

export default function CustomersPage() {
	const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
	const listState = useCustomersList();
	const { updateState } = useCustomersListActions();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	const filteredTransactions = useMemo(() => {
		const normalizedType = normalizeToken(listState.typeFilter);
		const normalizedQuery = listState.searchValue.trim().toLowerCase();

		return transactions.filter((row) => {
			if (normalizedType && normalizedType !== "all") {
				const rowType = normalizeToken(row.type);
				if (rowType !== normalizedType) {
					return false;
				}
			}

			if (!normalizedQuery) {
				return true;
			}

			if (listState.fieldFilter === "customer") {
				return row.customer.toLowerCase().includes(normalizedQuery);
			}

			if (listState.fieldFilter === "ref-no") {
				return row.refNo.toLowerCase().includes(normalizedQuery);
			}

			return (
				row.customer.toLowerCase().includes(normalizedQuery) ||
				row.refNo.toLowerCase().includes(normalizedQuery) ||
				row.type.toLowerCase().includes(normalizedQuery)
			);
		});
	}, [listState.fieldFilter, listState.searchValue, listState.typeFilter]);

	const totalItems = filteredTransactions.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / listState.pageSize));
	const currentPage = Math.min(listState.page, totalPages);
	const pagedTransactions = useMemo(() => {
		const startIndex = (currentPage - 1) * listState.pageSize;
		return filteredTransactions.slice(startIndex, startIndex + listState.pageSize);
	}, [currentPage, filteredTransactions, listState.pageSize]);

	const paginationItems = buildPagination(currentPage, totalPages);

	useEffect(() => {
		if (listState.page > totalPages) {
			updateState({ page: totalPages });
		}
	}, [listState.page, totalPages, updateState]);

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20" : "lg:w-1/4"}
			sidebar={
				<CustomerSidebar
					activeCustomerId={activeCustomerId}
					onSelect={setActiveCustomerId}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={
				<CustomerContent
					activeCustomerId={activeCustomerId}
					listState={listState}
					updateState={updateState}
					pagedTransactions={pagedTransactions}
					totalItems={totalItems}
					totalPages={totalPages}
					currentPage={currentPage}
					paginationItems={paginationItems}
				/>
			}
		/>
	);
}
