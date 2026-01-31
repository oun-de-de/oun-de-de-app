import { useEffect, useMemo, useState } from "react";

import { couponRows } from "@/_mock/data/dashboard";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { buildPagination, normalizeToken } from "@/core/utils/dashboard-utils";
import { CouponContent } from "./components/coupon-content";
import { CouponSidebar } from "./components/coupon-sidebar";
import { useCouponsList, useCouponsListActions } from "./stores/couponsListStore";

export default function CouponsPage() {
	const [activeCouponId, setActiveCouponId] = useState<string | null>(null);
	const listState = useCouponsList();
	const { updateState } = useCouponsListActions();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	const filteredCoupons = useMemo(() => {
		const normalizedType = normalizeToken(listState.typeFilter);
		const normalizedQuery = listState.searchValue.trim().toLowerCase();

		return couponRows.filter((row) => {
			// Filter by status (completed/pending)
			if (normalizedType && normalizedType !== "all") {
				const hasOut = row.out1Weight || row.out2Weight;
				const rowStatus = hasOut ? "completed" : "pending";
				if (rowStatus !== normalizedType) {
					return false;
				}
			}

			if (!normalizedQuery) {
				return true;
			}

			// Search by plate number, customer name, or coupon number
			if (listState.fieldFilter === "plate-number") {
				return (row.plateNumber || "").toLowerCase().includes(normalizedQuery);
			}

			if (listState.fieldFilter === "customer") {
				return (row.customerName || "").toLowerCase().includes(normalizedQuery);
			}

			if (listState.fieldFilter === "coupon-no") {
				return String(row.couponNo).includes(normalizedQuery);
			}

			return (
				(row.plateNumber || "").toLowerCase().includes(normalizedQuery) ||
				(row.customerName || "").toLowerCase().includes(normalizedQuery) ||
				String(row.couponNo).includes(normalizedQuery)
			);
		});
	}, [listState.fieldFilter, listState.searchValue, listState.typeFilter]);

	const totalItems = filteredCoupons.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / listState.pageSize));
	const currentPage = Math.min(listState.page, totalPages);

	const pagedCoupons = useMemo(() => {
		const startIndex = (currentPage - 1) * listState.pageSize;
		return filteredCoupons.slice(startIndex, startIndex + listState.pageSize);
	}, [currentPage, filteredCoupons, listState.pageSize]);

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
				<CouponSidebar
					activeCouponId={activeCouponId}
					onSelect={setActiveCouponId}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={
				<CouponContent
					activeCouponId={activeCouponId}
					listState={listState}
					updateState={updateState}
					pagedCoupons={pagedCoupons}
					totalItems={totalItems}
					totalPages={totalPages}
					currentPage={currentPage}
					paginationItems={paginationItems}
				/>
			}
		/>
	);
}
