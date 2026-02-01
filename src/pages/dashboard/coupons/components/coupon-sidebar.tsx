import { useMemo, useState } from "react";

import * as dashboard from "@/_mock/data/dashboard";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import type { SelectOption } from "@/core/types/common";
import { normalizeToken } from "@/core/utils/dashboard-utils";

type CouponSidebarProps = {
	activeCouponId: string | null;
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "all", label: "All Status" },
	{ value: "completed", label: "Completed" },
	{ value: "pending", label: "Pending" },
];

export function CouponSidebar({ activeCouponId, onSelect, onToggle, isCollapsed }: CouponSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [status, setStatus] = useState("all");
	const isLgUp = useMediaQuery(up("lg"));

	const filteredCoupons = useMemo(() => {
		const normalizedSearch = normalizeToken(searchTerm);
		const normalizedStatus = normalizeToken(status);

		return dashboard.couponList.filter((coupon) => {
			// Filter by Status
			if (normalizedStatus !== "all") {
				const couponStatus = normalizeToken(coupon.status || "");
				if (couponStatus !== normalizedStatus) return false;
			}

			// Filter by Search (Name or Plate Number)
			if (normalizedSearch) {
				const name = normalizeToken(coupon.name || "");
				const code = normalizeToken(coupon.code || "");
				if (!name.includes(normalizedSearch) && !code.includes(normalizedSearch)) {
					return false;
				}
			}

			return true;
		});
	}, [searchTerm, status]);

	const pagination = useSidebarPagination({
		data: filteredCoupons,
		enabled: !isLgUp,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				onMenuClick={onToggle}
				searchPlaceholder="Search coupons..."
				onSearchChange={setSearchTerm}
				statusOptions={STATUS_OPTIONS}
				onStatusChange={setStatus}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				className="mt-4 divide-y divide-border-gray-300 flex-1 min-h-0"
				data={pagination.pagedData}
				estimateSize={56}
				height="100%"
				renderItem={(item, style) => (
					<EntityListItem
						key={item.id}
						entity={item}
						isActive={item.id === activeCouponId}
						onSelect={onSelect}
						style={style}
						isCollapsed={isCollapsed}
					/>
				)}
			/>

			<SidebarList.Footer
				total={pagination.total}
				isCollapsed={isCollapsed}
				onPrev={pagination.handlePrev}
				onNext={pagination.handleNext}
				hasPrev={pagination.hasPrev}
				hasNext={pagination.hasNext}
				showControls={!isLgUp && pagination.totalPages > 1}
			/>
		</SidebarList>
	);
}
