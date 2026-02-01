import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import customerService from "@/core/api/services/customerService";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { useCustomersList, useCustomersListActions } from "@/core/store/customersListStore";
import type { Customer } from "@/core/types/customer";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { CustomerContent } from "./components/customer-content";
import { CustomerSidebar } from "./components/customer-sidebar";

export default function CustomersPage() {
	const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
	const listState = useCustomersList();
	const { updateState } = useCustomersListActions();
	const { isCollapsed, handleToggle } = useSidebarCollapse();

	const { data, isLoading } = useQuery({
		queryKey: ["customers", listState.page, listState.pageSize],
		queryFn: () =>
			customerService.getCustomerList({
				page: listState.page,
				limit: listState.pageSize,
				name: activeCustomer?.name || listState.searchValue || undefined,
			}),
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
					activeCustomerName={activeCustomer?.name}
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
