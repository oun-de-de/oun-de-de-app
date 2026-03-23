import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { BackButton } from "@/core/components/common";
import couponService from "@/core/api/services/coupon-service";
import employeeService from "@/core/api/services/employee-service";
import productService from "@/core/api/services/product-service";
import vehicleService from "@/core/api/services/vehicle-service";
import type { Customer } from "@/core/types/customer";
import type { Coupon, UpdateCouponRequest } from "@/core/types/coupon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { toUtcIsoStartOfDay } from "@/core/utils/date-utils";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";
import { CouponForm } from "../create/components/coupon-form";
import {
	createInitialRawWeightRecord,
	type DraftWeightRecord,
	WeightRecordsBuilder,
} from "../create/components/weight-records-builder";

type CouponEditLocationState = {
	coupon?: Coupon;
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

function toDateInputValue(value: string | null | undefined): string {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toNumberOrUndefined(value: unknown): number | undefined {
	if (value === "" || value === null || value === undefined) return undefined;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}

function validateCumulativeWeightRecords(records: DraftWeightRecord[]): string | null {
	if (records.length === 0) return "At least one weight record is required.";
	if (records[0].productName !== null) return "The first record must be raw vehicle weighing (productName = null).";

	let previousWeight: number | null = null;
	for (let i = 0; i < records.length; i++) {
		const record = records[i];
		if (record.weight !== null && previousWeight !== null && record.weight < previousWeight) {
			return `Record #${i + 1} has accumulated weight smaller than previous record.`;
		}
		if (record.weight !== null) previousWeight = record.weight;
	}
	return null;
}

function normalizeDraftWeightRecords(
	couponWeightRecords: Coupon["weightRecords"],
	products: Awaited<ReturnType<typeof productService.getProductList>>,
): DraftWeightRecord[] {
	if (couponWeightRecords.length === 0) {
		return [createInitialRawWeightRecord()];
	}

	const rawRecordIndex = couponWeightRecords.findIndex((record) => record.productName === null);
	const orderedRecords =
		rawRecordIndex >= 0
			? [couponWeightRecords[rawRecordIndex], ...couponWeightRecords.filter((_, index) => index !== rawRecordIndex)]
			: [createInitialRawWeightRecord(), ...couponWeightRecords];

	return orderedRecords.map((record, index) => ({
		productId:
			index === 0 || record.productName === null
				? undefined
				: products.find((product) => product.name === record.productName)?.id,
		productName: index === 0 ? null : record.productName || null,
		unit: record.unit,
		pricePerProduct: record.pricePerProduct,
		quantityPerProduct: record.quantityPerProduct,
		quantity: record.quantity,
		weight: record.weight,
		outTime: record.outTime,
		memo: record.memo,
		manual: record.manual,
	}));
}

export default function EditCouponPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();
	const locationState = location.state as CouponEditLocationState | null;
	const activeCustomer =
		locationState?.activeCustomer ??
		createCustomerSelection(searchParams.get("customerId"), searchParams.get("customerName"));
	const [weightRecords, setWeightRecords] = useState<DraftWeightRecord[]>([createInitialRawWeightRecord()]);

	const { data: employees = [] } = useQuery({
		queryKey: ["employees", "all"],
		queryFn: () => employeeService.getEmployeeList(),
	});
	const { data: vehicles = [] } = useQuery({
		queryKey: ["vehicles", "all"],
		queryFn: () => vehicleService.getVehicleList(),
	});
	const { data: products = [] } = useQuery({
		queryKey: ["products", "all"],
		queryFn: () => productService.getProductList(),
	});

	const couponQuery = useQuery({
		queryKey: ["coupon-edit", id],
		queryFn: async () => {
			if (locationState?.coupon) return locationState.coupon;
			// Temporary fallback: the current coupon API does not expose a get-by-id endpoint,
			// so direct URL access has to scan the list response to recover the selected coupon.
			const response = await couponService.getCouponList({ page: 1, limit: 10000 });
			return response.list.find((coupon) => coupon.id === id) ?? null;
		},
		enabled: !!id,
		initialData: locationState?.coupon ?? undefined,
	});

	const coupon = couponQuery.data ?? null;

	const employeeOptions = useMemo(
		() =>
			employees.map((employee) => ({
				label: getEmployeeDisplayName(employee),
				value: employee.id,
			})),
		[employees],
	);
	const vehicleOptions = useMemo(
		() =>
			vehicles.map((vehicle) => ({
				label: `${vehicle.vehicleType} - ${vehicle.licensePlate}`,
				value: vehicle.id,
			})),
		[vehicles],
	);

	const defaultValues = useMemo(
		() =>
			coupon
				? {
						date: toDateInputValue(coupon.date),
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
			setWeightRecords([createInitialRawWeightRecord()]);
			return;
		}

		setWeightRecords(normalizeDraftWeightRecords(coupon.weightRecords, products));
	}, [coupon, products]);

	const { mutateAsync: updateCoupon, isPending } = useMutation({
		mutationFn: async (data: UpdateCouponRequest) => {
			if (!coupon?.couponNo) throw new Error("Coupon number is required to update a coupon");
			return couponService.updateCouponByCouponNo(coupon.couponNo, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["coupons"] });
			toast.success("Coupon updated successfully");
			navigate(`/dashboard/coupons${location.search || ""}`, {
				state: {
					activeCustomer,
				},
			});
		},
		onError: () => {
			toast.error("Failed to update coupon");
		},
	});

	const weightRecordsComponent = useMemo<ReactNode>(
		() => <WeightRecordsBuilder products={products} records={weightRecords} onChange={setWeightRecords} />,
		[products, weightRecords],
	);

	const handleSubmit = async (data: Record<string, unknown>) => {
		const validationError = validateCumulativeWeightRecords(weightRecords);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		await updateCoupon({
			date: toUtcIsoStartOfDay(data.date),
			driverName: (data.driverName as string) || undefined,
			employeeId: (data.employeeId as string) || undefined,
			remark: (data.remark as string) || undefined,
			couponId: toNumberOrUndefined(data.couponId),
			accNo: (data.accNo as string) || undefined,
			weightRecords: weightRecords.map((record) => ({
				productName: record.productName,
				unit: record.unit,
				pricePerProduct: record.pricePerProduct,
				quantityPerProduct: record.quantityPerProduct,
				quantity: record.quantity,
				weight: record.weight,
				outTime: record.outTime,
				memo: record.memo,
				manual: record.manual,
			})),
		});
	};

	if (couponQuery.isLoading) {
		return (
			<div className="flex h-full flex-col gap-6 p-6">
				<div className="flex items-center gap-3">
					<BackButton
						onClick={() =>
							navigate(`/dashboard/coupons${location.search || ""}`, {
								state: {
									activeCustomer,
								},
							})
						}
					/>
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
					<BackButton
						onClick={() =>
							navigate(`/dashboard/coupons${location.search || ""}`, {
								state: {
									activeCustomer,
								},
							})
						}
					/>
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
						onClick={() =>
							navigate("/dashboard/coupons", {
								state: {
									activeCustomer: locationState?.activeCustomer ?? null,
								},
							})
						}
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
				<BackButton
					onClick={() =>
						navigate("/dashboard/coupons", {
							state: {
								activeCustomer: locationState?.activeCustomer ?? null,
							},
						})
					}
				/>
				<Text className="font-semibold text-sky-600">Edit Coupon</Text>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<CouponForm
						onSubmit={handleSubmit}
						onCancel={() =>
							navigate("/dashboard/coupons", {
								state: {
									activeCustomer: locationState?.activeCustomer ?? null,
								},
							})
						}
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
