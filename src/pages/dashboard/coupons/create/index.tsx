import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import couponService from "@/core/api/services/coupon-service";
import employeeService from "@/core/api/services/employee-service";
import productService from "@/core/api/services/product-service";
import vehicleService from "@/core/api/services/vehicle-service";
import { BackButton, type DefaultFormData } from "@/core/components/common";
import type { CreateCouponRequest } from "@/core/types/coupon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { formatDateStartLocalApiValueFromInput } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";
import { toCouponDateInputValue, toNumberOrUndefined } from "../utils/coupon-form-values";
import {
	createDraftWeightRecord,
	createEmptyDraftWeightRecord,
	type DraftWeightRecord,
	serializeDraftWeightRecords,
	validateCumulativeWeightRecords,
} from "../utils/weight-record-drafts";
import { CouponForm } from "./components/coupon-form";
import { WeightRecordsBuilder } from "./components/weight-records-builder";

function toIsoDateOrUndefined(value: unknown): string | undefined {
	return typeof value === "string" ? formatDateStartLocalApiValueFromInput(value) : undefined;
}

export default function CreateCouponPage() {
	const navigate = useNavigate();
	const [weightRecords, setWeightRecords] = useState<DraftWeightRecord[]>([createEmptyDraftWeightRecord()]);
	const [defaultValues, setDefaultValues] = useState<DefaultFormData | undefined>(undefined);
	const [formResetKey, setFormResetKey] = useState(0);

	// Fetch employees for dropdown
	const { data: employees = [] } = useQuery({
		queryKey: ["employees", "all"],
		queryFn: () => employeeService.getEmployeeList(),
	});

	const employeeOptions = employees.map((emp) => ({
		label: getEmployeeDisplayName(emp),
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
			driverName: "Nguyen Phu Hoi",
			remark: "buy 10kg solid ice",
			couponNo: 19,
			couponId: 19,
			accNo: "string",
			date: toCouponDateInputValue("2026-02-10T07:42:55.196Z"),
		});

		setWeightRecords([
			createDraftWeightRecord({
				productName: null,
				outTime: "2026-02-10T08:16:58.011Z",
			}),
			createDraftWeightRecord({
				productName: "solid ice",
				unit: "kg",
				pricePerProduct: 10,
				quantityPerProduct: null,
				quantity: 100,
				weight: 1008,
				outTime: "2026-02-10T08:16:58.011Z",
			}),
			createDraftWeightRecord({
				productName: "ice cubes",
				unit: "can",
				pricePerProduct: 200,
				quantityPerProduct: 10,
				quantity: 100,
				weight: 1218,
				outTime: "2026-02-10T08:16:58.011Z",
				memo: "daniel test memmo",
			}),
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

			const serializedDate = toIsoDateOrUndefined(data.date);
			if (!serializedDate) {
				toast.error("Date is invalid");
				return;
			}

			const couponData: CreateCouponRequest = {
				date: serializedDate,
				vehicleId: data.vehicleId as string,
				driverName: (data.driverName as string) || undefined,
				employeeId: data.employeeId as string,
				remark: (data.remark as string) || undefined,
				couponNo: toNumberOrUndefined(data.couponNo),
				couponId: toNumberOrUndefined(data.couponId),
				accNo: (data.accNo as string) || undefined,
				weightRecords: serializeDraftWeightRecords(weightRecords),
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
				<div className="flex items-center gap-3">
					<BackButton onClick={() => navigate("/dashboard/coupons")} />
					<Text className="font-semibold text-sky-600">Create New Coupon</Text>
				</div>
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
