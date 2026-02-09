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
		const customerData: CreateCustomer = {
			registerDate: data.registerDate as string,
			code: data.code as string,
			name: data.name as string,
			status: !!data.status,
			referredById: data.referredById as string,
			defaultPrice: data.defaultPrice as string,
			warehouse: data.warehouse as string,
			memo: data.memo as string,
			profileUrl: data.profileUrl as string,
			shopBannerUrl: data.shopBannerUrl as string,
			employeeId: data.employeeId as string,
			telephone: data.telephone as string,
			email: data.email as string,
			geography: data.geography as string,
			address: data.address as string,
			location: data.location as string,
			map: data.map as string,
			billingAddress: data.billingAddress as string,
			deliveryAddress: data.deliveryAddress as string,
			vehicles: data.vehicles ?? [],
		};

		await createCustomer(customerData);
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
