import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import couponService from "@/core/api/services/coupon-service";
import employeeService from "@/core/api/services/employee-service";
import productService from "@/core/api/services/product-service";
import vehicleService from "@/core/api/services/vehicle-service";
import type { DefaultFormData } from "@/core/components/common";
import type { CreateCouponRequest } from "@/core/types/coupon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { toUtcIsoStartOfDay } from "@/core/utils/date-utils";
import { CouponForm } from "./components/coupon-form";
import {
	createInitialRawWeightRecord,
	type DraftWeightRecord,
	WeightRecordsBuilder,
} from "./components/weight-records-builder";

function toNumberOrUndefined(value: unknown): number | undefined {
	if (value === "" || value === null || value === undefined) return undefined;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}

function toIsoDateOrUndefined(value: unknown): string | undefined {
	return toUtcIsoStartOfDay(value);
}

function toDateInputValue(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
		if (record.weight !== null) {
			previousWeight = record.weight;
		}
	}
	return null;
}

export default function CreateCouponPage() {
	const navigate = useNavigate();
	const [weightRecords, setWeightRecords] = useState<DraftWeightRecord[]>([createInitialRawWeightRecord()]);
	const [defaultValues, setDefaultValues] = useState<DefaultFormData | undefined>(undefined);
	const [formResetKey, setFormResetKey] = useState(0);

	// Fetch employees for dropdown
	const { data: employees = [] } = useQuery({
		queryKey: ["employees", "all"],
		queryFn: () => employeeService.getEmployeeList(),
	});

	const employeeOptions = employees.map((emp) => ({
		label: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.username,
		value: emp.id,
	}));

	const { data: vehicles } = useQuery({
		queryKey: ["vehicles", "all"],
		queryFn: () => vehicleService.getVehicleList(),
	});

	const { data: products = [] } = useQuery({
		queryKey: ["products", "all"],
		queryFn: () => productService.getProductList(),
	});

	const vehicleOptions = (vehicles ?? []).map((v) => ({
		label: `${v.vehicleType} - ${v.licensePlate}`,
		value: v.id,
	}));

	const weightRecordsComponent = useMemo(
		() => <WeightRecordsBuilder products={products} records={weightRecords} onChange={setWeightRecords} />,
		[products, weightRecords],
	);

	const handleFillSampleData = () => {
		setDefaultValues({
			vehicleId: "7e6e290e-693e-4dbe-9a88-8b758d3a5125",
			driverName: "Nguyen Phu Hoi",
			employeeId: "f9c52219-d4ba-431a-827a-bc7376c9f552",
			remark: "buy 10kg solid ice",
			couponNo: 19,
			couponId: 19,
			accNo: "string",
			delAccNo: "string",
			delDate: toDateInputValue("2026-02-10T07:42:55.196Z"),
		});

		setWeightRecords([
			{
				productName: null,
				unit: null,
				pricePerProduct: null,
				quantityPerProduct: null,
				quantity: null,
				weight: null,
				outTime: "2026-02-10T08:16:58.011Z",
				memo: null,
				manual: true,
			},
			{
				productName: "solid ice",
				unit: "kg",
				pricePerProduct: 10,
				quantityPerProduct: null,
				quantity: 100,
				weight: 1008,
				outTime: "2026-02-10T08:16:58.011Z",
				memo: null,
				manual: true,
			},
			{
				productName: "ice cubes",
				unit: "can",
				pricePerProduct: 200,
				quantityPerProduct: 10,
				quantity: 100,
				weight: 1218,
				outTime: "2026-02-10T08:16:58.011Z",
				memo: "daniel test memmo",
				manual: true,
			},
		]);

		setFormResetKey((prev) => prev + 1);
	};

	const handleSubmit = async (data: DefaultFormData) => {
		try {
			const validationError = validateCumulativeWeightRecords(weightRecords);
			if (validationError) {
				toast.error(validationError);
				return;
			}

			const couponData: CreateCouponRequest = {
				vehicleId: data.vehicleId as string,
				driverName: (data.driverName as string) || undefined,
				employeeId: data.employeeId as string,
				remark: (data.remark as string) || undefined,
				couponNo: toNumberOrUndefined(data.couponNo),
				couponId: toNumberOrUndefined(data.couponId),
				accNo: (data.accNo as string) || undefined,
				delAccNo: (data.delAccNo as string) || undefined,
				delDate: toIsoDateOrUndefined(data.delDate),
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
			};

			await couponService.createCoupon(couponData);

			toast.success("Coupon has been created successfully");
			navigate("/dashboard/invoice");
		} catch {
			toast.error("Failed to create coupon");
		}
	};

	const handleCancel = () => {
		navigate("/dashboard/coupons");
	};

	return (
		<div className="flex flex-col h-full p-6 gap-6">
			{/* Header */}
			<div className="flex items-center gap-3 justify-between">
				<Text className="font-semibold text-sky-600">Create New Coupon</Text>
				<Button type="button" variant="outline" onClick={handleFillSampleData}>
					Fill Sample Data
				</Button>
			</div>

			{/* Form */}
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<CouponForm
						key={formResetKey}
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						mode="create"
						showTitle={false}
						defaultValues={defaultValues}
						employeeOptions={employeeOptions}
						vehicleOptions={vehicleOptions}
						weightRecordsComponent={weightRecordsComponent}
					/>
				</div>
			</div>
		</div>
	);
}
