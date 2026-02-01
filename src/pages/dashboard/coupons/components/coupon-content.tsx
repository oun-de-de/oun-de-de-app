import { couponList, couponSummaryCards } from "@/_mock/data/dashboard";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { ListState } from "@/core/store/createListStore";
import type { CouponRow } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { columns } from "./coupon-columns";

type CouponContentProps = {
	activeCouponId: string | null;
	listState: ListState;
	updateState: (state: Partial<ListState>) => void;
	pagedCoupons: CouponRow[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
};

const summaryCards = couponSummaryCards;

const filterTypeOptions = [
	{ value: "all", label: "All" },
	{ value: "completed", label: "Completed" },
	{ value: "pending", label: "Pending" },
];

const filterFieldOptions = [
	{ value: "all", label: "All Fields" },
	{ value: "plate-number", label: "Plate Number" },
	{ value: "customer", label: "Customer" },
	{ value: "coupon-no", label: "Coupon No" },
];

export function CouponContent({
	activeCouponId,
	listState,
	updateState,
	pagedCoupons,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
}: CouponContentProps) {
	const activeCoupon = couponList.find((item) => item.id === activeCouponId);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1">
						<Icon icon="mdi:ticket-percent-outline" />
						Coupons
					</Button>
					<Text variant="body2" className="text-muted-foreground">
						{activeCoupon ? `${activeCoupon.name} selected` : "No coupon selected"}
					</Text>
				</div>
				<Button size="sm" className="gap-2">
					<Icon icon="mdi:plus" />
					New Coupon
					<Icon icon="mdi:chevron-down" />
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedCoupons}
				columns={columns}
				filterConfig={{
					typeOptions: filterTypeOptions,
					fieldOptions: filterFieldOptions,
					typeValue: listState.typeFilter,
					fieldValue: listState.fieldFilter,
					searchValue: listState.searchValue,
					typePlaceholder: "Status",
					onTypeChange: (value: string) => updateState({ typeFilter: value, page: 1 }),
					onFieldChange: (value: string) => updateState({ fieldFilter: value, page: 1 }),
					onSearchChange: (value: string) => updateState({ searchValue: value, page: 1 }),
				}}
				paginationConfig={{
					page: currentPage,
					pageSize: listState.pageSize,
					totalItems: totalItems,
					totalPages: totalPages,
					paginationItems: paginationItems,
					onPageChange: (nextPage: number) => updateState({ page: nextPage }),
					onPageSizeChange: (nextSize: number) => updateState({ pageSize: nextSize, page: 1 }),
				}}
			/>
		</>
	);
}
