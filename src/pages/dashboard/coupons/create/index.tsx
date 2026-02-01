import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import couponService from "@/core/api/services/couponService";
import employeeService from "@/core/api/services/employeeService";
import vehicleService from "@/core/api/services/vehicleService";
import type { DefaultFormData } from "@/core/components/common";
import type { CreateCouponRequest } from "@/core/types/coupon";
import { Text } from "@/core/ui/typography";
import { CouponForm } from "./components/coupon-form";

export default function CreateCouponPage() {
	const navigate = useNavigate();

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

	const vehicleOptions = (vehicles ?? []).map((v) => ({
		label: `${v.vehicleType} - ${v.licensePlate}`,
		value: v.id,
	}));

	const handleSubmit = async (data: DefaultFormData) => {
		try {
			const couponData: CreateCouponRequest = {
				date: data.date as string,
				vehicleId: data.vehicleId as string,
				driverName: data.driverName as string,
				employeeId: data.employeeId as string,
				remark: (data.remark as string) || "",
				weightRecords: [],
			};

			await couponService.createCoupon(couponData);

			toast.success("Coupon has been created successfully");
			navigate("/dashboard/coupons");
		} catch (error) {
			toast.error("Failed to create coupon");
			console.error(error);
		}
	};

	const handleCancel = () => {
		navigate("/dashboard/coupons");
	};

	return (
		<div className="flex flex-col h-full p-6 gap-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Create New Coupon</Text>
			</div>

			{/* Form */}
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<CouponForm
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						mode="create"
						showTitle={false}
						employeeOptions={employeeOptions}
						vehicleOptions={vehicleOptions}
					/>
				</div>
			</div>
		</div>
	);
}
