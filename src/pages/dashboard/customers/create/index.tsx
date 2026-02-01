import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import customerService from "@/core/api/services/customerService";
import employeeService from "@/core/api/services/employeeService";
import type { DefaultFormData } from "@/core/components/common";
import type { CreateCustomer } from "@/core/types/customer";
import { Text } from "@/core/ui/typography";
import { CustomerForm } from "./components/customer-form";

export default function CreateCustomerPage() {
	const { data: employees = [] } = useQuery({
		queryKey: ["employees", "all"],
		queryFn: () => employeeService.getEmployeeList(),
	});

	const employeeOptions = employees.map((emp) => ({
		label: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.username,
		value: emp.id,
	}));

	const handleSubmit = async (data: DefaultFormData) => {
		try {
			// Transform data to match API schema
			const customerData: CreateCustomer = {
				registerDate: data.registerDate as string,
				code: data.code as string,
				name: data.name as string,
				status: !!data.status,
				customerType: data.customerType as string,
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
				vehicles: [],
			};

			await customerService.createCustomer(customerData);

			toast.success("Customer has been created successfully");
		} catch (error) {
			toast.error("Failed to create customer");
			console.error(error);
		}
	};

	const handleCancel = () => {};

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
					/>
				</div>
			</div>
		</div>
	);
}
