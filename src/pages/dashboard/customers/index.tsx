import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import customerService from "@/core/api/services/customer-service";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { CustomerContent } from "./components/customer-content";
import { CustomerSidebar } from "./components/customer-sidebar";
import { useCustomerListActions, useCustomerListState } from "./stores/customer-list-store";

export default function CustomersPage() {
	const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
	const listState = useCustomerListState();
	const { updateState } = useCustomerListActions();
	const { isCollapsed, handleToggle } = useSidebarCollapse();

	// clear active customer when user starts searching
	useEffect(() => {
		if (listState.searchValue && activeCustomer) {
			setActiveCustomer(null);
		}
	}, [listState.searchValue, activeCustomer]);

	// function to query customers list
	const { data, isLoading } = useQuery({
		queryKey: [
			"customers",
			listState.page,
			listState.pageSize,
			listState.searchValue,
			listState.typeFilter,
			listState.fieldFilter,
			activeCustomer?.name,
		],
		queryFn: () => {
			const searchValue = activeCustomer?.name || listState.searchValue || undefined;
			return customerService.getCustomerList({
				page: listState.page,
				limit: listState.pageSize,
				// Use fieldFilter to determine which field to search by
				name: listState.fieldFilter === "name" || listState.fieldFilter === "all" ? searchValue : undefined,
				code: listState.fieldFilter === "code" ? searchValue : undefined,
				status: listState.typeFilter !== "all" ? listState.typeFilter : undefined,
			});
		},
	});

	const customers = data?.list ?? [];
	const totalItems = data?.total ?? 0;
	const rawTotalPages = data?.pageCount ?? 0;
	const rawCurrentPage = data?.page ?? 0;
	const totalPages = rawTotalPages > 0 ? rawTotalPages : 1;
	const currentPage = rawCurrentPage > 0 ? rawCurrentPage : 1;
	const paginationItems = buildPagination(currentPage, totalPages);

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20" : "lg:w-1/4"}
			sidebar={
				<CustomerSidebar
					activeCustomerId={activeCustomer?.id || null}
					onSelect={setActiveCustomer}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={
				<CustomerContent
					activeCustomer={activeCustomer}
					listState={listState}
					updateState={updateState}
					pagedData={customers}
					totalItems={totalItems}
					totalPages={totalPages}
					currentPage={currentPage}
					paginationItems={paginationItems}
					isLoading={isLoading}
				/>
			}
		/>
	);
}
