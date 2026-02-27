import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import employeeService from "@/core/api/services/employee-service";
import type { CreateCustomer } from "@/core/types/customer";
import { Text } from "@/core/ui/typography";
import { CustomerForm, type CustomerFormData } from "./components/customer-form";

export default function CreateCustomerPage() {
	const navigate = useNavigate();

	const { data: employees = [] } = useQuery({
		queryKey: ["employees", "all"],
		queryFn: () => employeeService.getEmployeeList(),
	});

	const employeeOptions = employees.map((emp) => ({
		label: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.username,
		value: emp.id,
	}));

	const { data: customersResponse } = useQuery({
		queryKey: ["customers", "referredByOptions"],
		queryFn: () => customerService.getCustomerList({ limit: 1000 }),
	});

	const customerOptions =
		customersResponse?.list && customersResponse.list.length > 0
			? customersResponse.list.map((cus) => ({
					label: cus.name,
					value: cus.id,
				}))
			: [{ label: "None", value: "none", disabled: true }];

	const { mutateAsync: createCustomer } = useMutation({
		mutationFn: async (data: CreateCustomer) => {
			return customerService.createCustomer(data);
		},
		onSuccess: () => {
			toast.success("Customer has been created successfully");
			navigate("/dashboard/customers");
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to create customer");
		},
	});

	const handleSubmit = async (data: CustomerFormData) => {
		const duration = Number(data.paymentTerm);
		const parsedStartDate = data.startDate ? new Date(`${data.startDate}T00:00:00.000Z`) : undefined;
		const hasPaymentTermValue = data.paymentTerm !== "" && data.paymentTerm != null;
		const paymentTerm =
			hasPaymentTermValue &&
			Number.isFinite(duration) &&
			duration >= 0 &&
			parsedStartDate &&
			!Number.isNaN(parsedStartDate.getTime())
				? { duration, startDate: parsedStartDate.toISOString() }
				: undefined;

		const referredById = data.referredById && data.referredById !== "none" ? data.referredById : undefined;

		const payload: CreateCustomer = {
			registerDate: data.registerDate,
			code: data.code,
			name: data.name,
			status: !!data.status,
			referredById,
			defaultPrice: data.defaultPrice,
			warehouseId: data.warehouseId,
			memo: data.memo,
			profileUrl: data.profileUrl,
			shopBannerUrl: data.shopBannerUrl,
			employeeId: data.employeeId,
			telephone: data.telephone,
			email: data.email,
			geography: data.geography,
			address: data.address,
			location: data.location,
			map: data.map,
			billingAddress: data.billingAddress,
			deliveryAddress: data.deliveryAddress,
			vehicles: data.vehicles ?? [],
			paymentTerm,
		};

		await createCustomer(payload);
	};

	const handleCancel = () => navigate("/dashboard/customers");

	return (
		<div className="flex flex-col h-full p-6 gap-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Create New Customer</Text>
			</div>

			{/* Form */}
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<CustomerForm
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						mode="create"
						showTitle={false}
						employeeOptions={employeeOptions}
						customerOptions={customerOptions}
					/>
				</div>
			</div>
		</div>
	);
}
