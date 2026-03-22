import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "react-router";

import couponService from "@/core/api/services/coupon-service";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { CustomerSidebar } from "@/pages/dashboard/customers/components/customer-sidebar";
import { CouponContent } from "./components/coupon-content";
import { useCouponsList, useCouponsListActions } from "./stores/coupons-store";

type CouponsLocationState = {
	activeCustomer?: Customer | null;
};

export default function CouponsPage() {
	const location = useLocation();
	const locationState = location.state as CouponsLocationState | null;
	const [activeCustomer, setActiveCustomer] = useState<Customer | null>(locationState?.activeCustomer ?? null);

	const listState = useCouponsList();
	const { updateState } = useCouponsListActions();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	const handleCustomerSelect = (customer: Customer | null) => {
		setActiveCustomer(customer);
		updateState({ page: 1 });
	};

	const { data, isLoading } = useQuery({
		queryKey: ["coupons", listState.page, listState.pageSize, activeCustomer?.id],
		queryFn: () =>
			couponService.getCouponList({
				page: listState.page,
				limit: listState.pageSize,
				customerId: activeCustomer?.id || undefined,
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
			isSidebarCollapsed={isCollapsed}
			sidebarClassName={isCollapsed ? "md:w-14 xl:w-14" : "md:w-[16rem] xl:w-1/5"}
			sidebar={
				<CustomerSidebar
					activeCustomerId={activeCustomer?.id || null}
					onSelect={handleCustomerSelect}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
					showPaymentTermFilter={false}
				/>
			}
			content={
				<CouponContent
					activeCustomerName={activeCustomer?.name}
					activeCustomer={activeCustomer}
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
