import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import couponService from "@/core/api/services/coupon-service";
import { EntityListItem, SidebarList } from "@/core/components/common";
import type { SelectOption } from "@/core/types/common";
import type { Coupon } from "@/core/types/coupon";

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
	const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ["coupons", "sidebar", { search: searchTerm, status }],
		queryFn: ({ pageParam = 1 }) =>
			couponService.getCouponList({
				page: pageParam,
				limit: 20,
				search: searchTerm || undefined,
				status: status === "all" ? undefined : status,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => (lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined),
	});

	const coupons = data?.pages.flatMap((page) => page.list) ?? [];
	const totalFromApi = data?.pages[0]?.total ?? 0;
	const total = totalFromApi > 0 ? totalFromApi : coupons.length;

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
				data={coupons}
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
						isCollapsed={isCollapsed}
					/>
				)}
			/>

			<SidebarList.Footer
				total={total}
				isCollapsed={isCollapsed}
				onPrev={() => {}}
				onNext={() => fetchNextPage()}
				hasPrev={false}
				hasNext={!!hasNextPage}
				showControls={!!hasNextPage}
			/>
		</SidebarList>
	);
}
