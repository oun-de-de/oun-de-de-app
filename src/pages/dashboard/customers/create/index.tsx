import { Text } from "@/core/ui/typography";
import { toast } from "sonner";

import type { DefaultFormData } from "@/core/components/common";
import { CustomerForm } from "./components/customer-form";

export default function CreateCustomerPage() {
	const handleSubmit = async (data: DefaultFormData) => {
		try {
			// Transform data to match API schema
			const customerData = {
				registerDate: data.registerDate as string,
				code: data.code as string,
				name: data.name as string,
				status: data.status as boolean,
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
			};

			// TODO: Replace with actual API call
			console.log("Customer data:", customerData);
			// await createCustomer(customerData);

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
				<div className="max-w-5xl">
					<CustomerForm onSubmit={handleSubmit} onCancel={handleCancel} mode="create" showTitle={false} />
				</div>
			</div>
		</div>
	);
}
