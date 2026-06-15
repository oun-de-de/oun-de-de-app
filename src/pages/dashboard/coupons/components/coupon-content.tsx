import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { couponSummaryCards } from "@/_mock/data/dashboard";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import couponService from "@/core/api/services/coupon-service";
import { COUPON_QUERY_KEYS } from "@/core/query-keys/coupon-query-keys";
import type { Customer } from "@/core/types/customer";
import type { Coupon } from "@/core/types/coupon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { useLocation, useNavigate } from "react-router";
import type { CouponState } from "../stores/coupon-state";
import { getCouponColumns } from "./coupon-columns";
import { CouponDeleteDialog } from "./coupon-delete-dialog";
import { CouponWeightRecordsDialog } from "./coupon-weight-records-dialog";

type CouponContentProps = {
	activeCustomerName: string | null | undefined;
	activeCustomer?: Customer | null;
	listState: CouponState;
	updateState: (state: Partial<CouponState>) => void;
	pagedCoupons: Coupon[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
	isLoading?: boolean;
};

const summaryCards = couponSummaryCards;
const getCouponDraftStorageKey = (couponId: string) => `coupon-edit:draft:${couponId}`;

export function CouponContent({
	activeCustomerName,
	activeCustomer,
	listState,
	updateState,
	pagedCoupons,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
}: CouponContentProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
	const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
	const columns = useMemo(
		() =>
			getCouponColumns({
				onViewWeightRecords: setSelectedCoupon,
				onEditCoupon: (coupon) => {
					window.sessionStorage.setItem(getCouponDraftStorageKey(coupon.id), JSON.stringify(coupon));
					navigate(`/dashboard/coupons/edit/${coupon.id}${location.search || ""}`, {
						state: {
							coupon,
							activeCustomer,
						},
					});
				},
				onDeleteCoupon: setDeletingCoupon,
			}),
		[navigate, activeCustomer, location.search],
	);
	const { data: weightRecords = [], isLoading: isWeightRecordsLoading } = useQuery({
		queryKey: COUPON_QUERY_KEYS.weightRecords(selectedCoupon?.id),
		queryFn: () => couponService.getCouponWeightRecords(selectedCoupon!.id),
		enabled: Boolean(selectedCoupon?.id),
	});

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
				<div className="flex items-center gap-2">
					<Text variant="body2" className="text-muted-foreground">
						{activeCustomerName ? `Coupons for ${activeCustomerName}` : "No customer selected"}
					</Text>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={() => navigate("/dashboard/coupons/create")}>
						Create Coupons
					</Button>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 pb-2">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedCoupons}
				columns={columns}
				enableFilterBar={false}
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

			<CouponWeightRecordsDialog
				open={Boolean(selectedCoupon)}
				onOpenChange={(open) => {
					if (!open) setSelectedCoupon(null);
				}}
				coupon={selectedCoupon}
				weightRecords={weightRecords}
				isLoading={isWeightRecordsLoading}
			/>
			<CouponDeleteDialog
				open={Boolean(deletingCoupon)}
				onOpenChange={(open) => {
					if (!open) setDeletingCoupon(null);
				}}
				coupon={deletingCoupon}
			/>
		</>
	);
}
