import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

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

function createCustomerSelection(customerId: string | null, customerName: string | null): Customer | null {
	if (!customerId || !customerName) return null;

	return {
		id: customerId,
		name: customerName,
		registerDate: "",
		code: "",
		status: true,
		defaultPrice: "",
		warehouseId: "",
		memo: "",
		profileUrl: "",
		shopBannerUrl: "",
		employeeId: "",
		telephone: "",
		email: "",
		geography: "",
		address: "",
		location: "",
		map: "",
		billingAddress: "",
		deliveryAddress: "",
		vehicles: [],
	};
}

export default function CouponsPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const locationState = location.state as CouponsLocationState | null;
	const [activeCustomer, setActiveCustomer] = useState<Customer | null>(() => {
		const queryCustomer = createCustomerSelection(searchParams.get("customerId"), searchParams.get("customerName"));
		return queryCustomer ?? locationState?.activeCustomer ?? null;
	});

	const listState = useCouponsList();
	const { updateState } = useCouponsListActions();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	useEffect(() => {
		const queryCustomer = createCustomerSelection(searchParams.get("customerId"), searchParams.get("customerName"));
		setActiveCustomer((prev) => {
			if (
				(prev?.id ?? null) === (queryCustomer?.id ?? null) &&
				(prev?.name ?? null) === (queryCustomer?.name ?? null)
			) {
				return prev;
			}
			return queryCustomer;
		});
	}, [searchParams]);

	const updateCouponsSearchParams = useCallback(
		(next: { customerId?: string | null; customerName?: string | null }) => {
			const params = new URLSearchParams(location.search);

			if (next.customerId) {
				params.set("customerId", next.customerId);
			} else {
				params.delete("customerId");
			}

			if (next.customerName) {
				params.set("customerName", next.customerName);
			} else {
				params.delete("customerName");
			}

			const nextSearch = params.toString();
			navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ""}`);
		},
		[location.pathname, location.search, navigate],
	);

	const handleCustomerSelect = useCallback(
		(customer: Customer | null) => {
			setActiveCustomer(customer);
			updateState({ page: 1 });
			updateCouponsSearchParams({
				customerId: customer?.id ?? null,
				customerName: customer?.name ?? null,
			});
		},
		[updateCouponsSearchParams, updateState],
	);

	const { data, isLoading } = useQuery({
		queryKey: ["coupons", listState.page, listState.pageSize, activeCustomer?.id],
		queryFn: () =>
			couponService.getCouponList({
				page: listState.page,
				limit: listState.pageSize,
				customerId: activeCustomer?.id || undefined,
				sort: "couponNo,desc",
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
					activeCustomerName={activeCustomer?.name || null}
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
