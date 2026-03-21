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
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => (lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined),
	});

	const coupons = (data?.pages.flatMap((page) => page.list) ?? []).filter((coupon) => {
		const matchesSearch =
			!searchTerm ||
			coupon.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			coupon.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus = status === "all";

		return matchesSearch && matchesStatus;
	});
	const totalFromApi = data?.pages[0]?.total ?? 0;
	const total = totalFromApi > 0 ? totalFromApi : coupons.length;

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				showStatusFilter={false}
				onMenuClick={onToggle}
				searchPlaceholder="Search coupons..."
				onSearchChange={setSearchTerm}
				statusOptions={STATUS_OPTIONS}
				onStatusChange={setStatus}
				isCollapsed={isCollapsed}
			/>

			{isCollapsed ? (
				<SidebarList.CollapsedHint text="Click to expand coupon list" onClick={onToggle} />
			) : (
				<>
					<SidebarList.Body
						className="mt-4 flex-1 min-h-0 divide-y divide-border-gray-300"
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
							/>
						)}
					/>

					<SidebarList.Footer
						total={total}
						isCollapsed={false}
						onPrev={() => {}}
						onNext={() => fetchNextPage()}
						hasPrev={false}
						hasNext={!!hasNextPage}
						showControls={!!hasNextPage}
					/>
				</>
			)}
		</SidebarList>
	);
}
