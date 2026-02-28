import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import couponService from "@/core/api/services/coupon-service";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { CustomerSidebar } from "@/pages/dashboard/customers/components/customer-sidebar";
import { CouponContent } from "./components/coupon-content";
import { useCouponsList, useCouponsListActions } from "./stores/coupons-store";

export default function CouponsPage() {
	const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

	const listState = useCouponsList();
	const { updateState } = useCouponsListActions();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	const handleCustomerSelect = (customer: Customer | null) => {
		setActiveCustomer(customer);
		updateState({ page: 1 });
	};

	const { data, isLoading } = useQuery({
		queryKey: [
			"coupons",
			listState.page,
			listState.pageSize,
			listState.searchValue,
			listState.typeFilter,
			activeCustomer?.id,
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
	const isClientPaginationFallback =
		(data?.pageCount ?? 0) <= 1 && coupons.length > listState.pageSize && (data?.pageSize ?? 0) >= coupons.length;
	const totalItems = isClientPaginationFallback ? coupons.length : (data?.total ?? 0);
	const totalPages = isClientPaginationFallback
		? Math.max(1, Math.ceil(totalItems / listState.pageSize))
		: (data?.pageCount ?? 0) > 0
			? (data?.pageCount ?? 0)
			: 1;
	const currentPage = isClientPaginationFallback
		? Math.min(listState.page, totalPages)
		: (data?.page ?? 0) > 0
			? (data?.page ?? 0)
			: 1;
	const pagedCoupons = isClientPaginationFallback
		? coupons.slice((currentPage - 1) * listState.pageSize, currentPage * listState.pageSize)
		: coupons;
	const paginationItems = buildPagination(currentPage, totalPages);

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20" : "lg:w-1/4"}
			sidebar={
				<CustomerSidebar
					activeCustomerId={activeCustomer?.id || null}
					onSelect={handleCustomerSelect}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={
				<CouponContent
					activeCustomerName={activeCustomer?.name}
					listState={listState}
					updateState={updateState}
					pagedCoupons={pagedCoupons}
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
