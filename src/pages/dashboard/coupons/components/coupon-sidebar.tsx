import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import couponService from "@/core/api/services/coupon-service";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import { COUPON_QUERY_KEYS } from "@/core/query-keys/coupon-query-keys";
import type { SelectOption } from "@/core/types/common";
import { isCouponDeleted, type Coupon } from "@/core/types/coupon";

type CouponSidebarProps = {
	activeCouponId: string | null;
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "all", label: "All Status" },
	{ value: "active", label: "Active" },
	{ value: "deleted", label: "Deleted" },
];

export function CouponSidebar({ activeCouponId, onSelect, onToggle, isCollapsed }: CouponSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [status, setStatus] = useState("all");
	const couponListParams = { page: 1, limit: 1000 };
	const { data } = useQuery({
		queryKey: COUPON_QUERY_KEYS.list(couponListParams),
		queryFn: () => couponService.getCouponList(couponListParams),
	});

	const coupons = (data?.list ?? []).filter((coupon) => {
		const matchesSearch =
			!searchTerm ||
			coupon.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			coupon.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());

		const isDeleted = isCouponDeleted(coupon);
		const matchesStatus = status === "all" || (status === "deleted" ? isDeleted : !isDeleted);

		return matchesSearch && matchesStatus;
	});
	const total = coupons.length;
	const pagination = useSidebarPagination({
		data: coupons,
		pageSize: 20,
		resetKey: `${searchTerm}|${status}`,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				showStatusFilter={false}
				onMenuClick={onToggle}
				searchPlaceholder="Search coupons..."
				onSearchChange={setSearchTerm}
				statusOptions={STATUS_OPTIONS}
				statusValue={status}
				onStatusChange={setStatus}
				isCollapsed={isCollapsed}
			/>

			{isCollapsed ? (
				<SidebarList.CollapsedHint text="Click to expand coupon list" onClick={onToggle} />
			) : (
				<>
					<SidebarList.Body
						className="mt-4 flex-1 min-h-0 divide-y divide-border-gray-300"
						data={pagination.pagedData}
						estimateSize={56}
						height="100%"
						renderItem={(item: Coupon, style) => (
							<EntityListItem
								key={item.id}
								entity={{
									id: item.id,
									name: item.driverName || `Coupon #${item.id.slice(0, 8)}`,
									code: item.vehicle?.licensePlate ?? "",
								}}
								isActive={item.id === activeCouponId}
								onSelect={onSelect}
								style={style}
							/>
						)}
					/>

					<SidebarList.Footer
						total={total}
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						rangeStart={pagination.rangeStart}
						rangeEnd={pagination.rangeEnd}
						isCollapsed={false}
						onPrev={pagination.handlePrev}
						onNext={pagination.handleNext}
						hasPrev={pagination.hasPrev}
						hasNext={pagination.hasNext}
						showControls={pagination.totalPages > 1}
					/>
				</>
			)}
		</SidebarList>
	);
}
