import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import couponService from "@/core/api/services/couponService";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { CustomerSidebar } from "@/pages/dashboard/customers/components/customer-sidebar";
import { CouponContent } from "./components/coupon-content";
import { useCouponsList, useCouponsListActions } from "./stores/couponsListStore";

export default function CouponsPage() {
	const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

	const listState = useCouponsList();
	const { updateState } = useCouponsListActions();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	const { data, isLoading } = useQuery({
		queryKey: [
			"coupons",
			listState.page,
			listState.pageSize,
			listState.searchValue,
			listState.typeFilter,
			activeCustomer?.name,
		],
		queryFn: () =>
			couponService.getCouponList({
				page: listState.page,
				limit: listState.pageSize,
				search: activeCustomer?.name || listState.searchValue || undefined,
				status: listState.typeFilter !== "all" ? listState.typeFilter : undefined,
			}),
	});

	const coupons = data?.list ?? [];
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
				<CouponContent
					activeCustomerName={activeCustomer?.name}
					listState={listState}
					updateState={updateState}
					pagedCoupons={coupons}
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
