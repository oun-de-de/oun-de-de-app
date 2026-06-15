import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import couponService from "@/core/api/services/coupon-service";
import { BackButton } from "@/core/components/common";
import { COUPON_QUERY_KEYS } from "@/core/query-keys/coupon-query-keys";
import type { Coupon, UpdateCouponRequest } from "@/core/types/coupon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { formatDateStartLocalApiValueFromInput } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import { CouponForm } from "../create/components/coupon-form";
import { WeightRecordsBuilder } from "../create/components/weight-records-builder";
import { useCouponReferenceData } from "../hooks/use-coupon-reference-data";
import { toCouponDateInputValue, toNumberOrUndefined } from "../utils/coupon-form-values";
import {
	createEmptyDraftWeightRecord,
	type DraftWeightRecord,
	normalizeDraftWeightRecords,
	serializeDraftWeightRecords,
	validateCumulativeWeightRecords,
} from "../utils/weight-record-drafts";

type CouponEditLocationState = {
	coupon?: Coupon;
};

const getCouponDraftStorageKey = (couponId: string) => `coupon-edit:draft:${couponId}`;

export default function EditCouponPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();
	const locationState = location.state as CouponEditLocationState | null;
	const cachedCoupon = useMemo(() => {
		if (!id) return null;
		const raw = window.sessionStorage.getItem(getCouponDraftStorageKey(id));
		if (!raw) return null;

		try {
			return JSON.parse(raw) as Coupon;
		} catch {
			return null;
		}
	}, [id]);
	const [weightRecords, setWeightRecords] = useState<DraftWeightRecord[]>([createEmptyDraftWeightRecord()]);
	const activeCouponIdRef = useRef<string | null>(null);
	const hasEditedWeightRecordsRef = useRef(false);

	const { products, employeeOptions, vehicleOptions } = useCouponReferenceData();

	const couponQuery = useQuery({
		queryKey: COUPON_QUERY_KEYS.detail(id),
		queryFn: async () => {
			if (!id) return null;
			return couponService.getCoupon(id);
		},
		enabled: !!id,
		initialData: locationState?.coupon ?? cachedCoupon ?? undefined,
	});

	const coupon = couponQuery.data ?? null;
	const couponId = coupon?.id;
	const { data: couponWeightRecords } = useQuery({
		queryKey: COUPON_QUERY_KEYS.weightRecords(couponId),
		queryFn: () => (couponId ? couponService.getCouponWeightRecords(couponId) : Promise.resolve([])),
		enabled: Boolean(couponId),
	});

	const defaultValues = useMemo(
		() =>
			coupon
				? {
						date: toCouponDateInputValue(coupon.date),
						vehicleId: coupon.vehicle?.id ?? "",
						driverName: coupon.driverName ?? "",
						employeeId: coupon.employee?.id ?? "",
						remark: coupon.remark ?? "",
						couponNo: coupon.couponNo ?? "",
						couponId: coupon.couponId ?? "",
						accNo: coupon.accNo ?? "",
					}
				: undefined,
		[coupon],
	);

	useEffect(() => {
		if (!coupon) {
			activeCouponIdRef.current = null;
			hasEditedWeightRecordsRef.current = false;
			setWeightRecords([createEmptyDraftWeightRecord()]);
			return;
		}

		if (activeCouponIdRef.current !== coupon.id) {
			activeCouponIdRef.current = coupon.id;
			hasEditedWeightRecordsRef.current = false;
		}

		const sourceWeightRecords = couponWeightRecords ?? coupon.weightRecords;
		window.sessionStorage.setItem(
			getCouponDraftStorageKey(coupon.id),
			JSON.stringify({ ...coupon, weightRecords: sourceWeightRecords }),
		);

		if (hasEditedWeightRecordsRef.current) {
			return;
		}

		setWeightRecords(normalizeDraftWeightRecords(sourceWeightRecords, products));
	}, [coupon, couponWeightRecords, products]);

	const { mutateAsync: updateCoupon, isPending } = useMutation({
		mutationFn: async (data: UpdateCouponRequest) => {
			if (!coupon?.couponNo) throw new Error("Coupon number is required to update a coupon");
			return couponService.updateCouponByCouponNo(coupon.couponNo, data);
		},
		onSuccess: () => {
			if (coupon?.id) {
				window.sessionStorage.removeItem(getCouponDraftStorageKey(coupon.id));
			}
			queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all });
			toast.success("Coupon updated successfully");
			navigate("/dashboard/coupons");
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : "Failed to update coupon";
			toast.error(message);
		},
	});

	const weightRecordsComponent = useMemo<ReactNode>(
		() => (
			<WeightRecordsBuilder
				products={products}
				records={weightRecords}
				onChange={(nextRecords) => {
					hasEditedWeightRecordsRef.current = true;
					setWeightRecords(nextRecords);
				}}
			/>
		),
		[products, weightRecords],
	);

	const handleSubmit = async (data: Record<string, unknown>) => {
		const validationError = validateCumulativeWeightRecords(weightRecords);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		const serializedDate = typeof data.date === "string" ? formatDateStartLocalApiValueFromInput(data.date) : undefined;
		if (!serializedDate) {
			toast.error("Date is invalid");
			return;
		}

		await updateCoupon({
			date: serializedDate,
			driverName: (data.driverName as string) || undefined,
			employeeId: (data.employeeId as string) || undefined,
			remark: (data.remark as string) || undefined,
			couponId: toNumberOrUndefined(data.couponId),
			accNo: (data.accNo as string) || undefined,
			weightRecords: serializeDraftWeightRecords(weightRecords),
		});
	};

	if (couponQuery.isLoading) {
		return (
			<div className="flex h-full flex-col gap-6 p-6">
				<div className="flex items-center gap-3">
					<BackButton onClick={() => navigate("/dashboard/coupons")} />
					<Text className="font-semibold text-sky-600">Edit Coupon</Text>
				</div>
				<div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
					Loading coupon details...
				</div>
			</div>
		);
	}

	if (!coupon) {
		return (
			<div className="flex h-full flex-col gap-6 p-6">
				<div className="flex items-center gap-3">
					<BackButton onClick={() => navigate("/dashboard/coupons")} />
					<Text className="font-semibold text-sky-600">Edit Coupon</Text>
				</div>
				<div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-6">
					<Text className="font-medium text-amber-900">Coupon not found</Text>
					<Text className="text-sm text-amber-800">
						The coupon may have been removed or this page was opened without a valid coupon context.
					</Text>
					<Button
						type="button"
						variant="outline"
						className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
						onClick={() => navigate("/dashboard/coupons")}
					>
						Back to Coupons
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full p-6 gap-6">
			<div className="flex items-center gap-3">
				<BackButton onClick={() => navigate("/dashboard/coupons")} />
				<Text className="font-semibold text-sky-600">Edit Coupon</Text>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<CouponForm
						onSubmit={handleSubmit}
						onCancel={() => navigate("/dashboard/coupons")}
						mode="edit"
						showTitle={false}
						defaultValues={defaultValues}
						employeeOptions={employeeOptions}
						vehicleOptions={vehicleOptions}
						weightRecordsComponent={weightRecordsComponent}
					/>
					{isPending ? <div className="mt-3 text-sm text-slate-500">Saving coupon...</div> : null}
				</div>
			</div>
		</div>
	);
}
