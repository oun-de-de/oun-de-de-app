import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import type { CreateCustomer } from "@/core/types/customer";
import { Text } from "@/core/ui/typography";
import { toUtcIsoPreferNowIfToday } from "@/core/utils/date-utils";
import { useFormOptions } from "../hooks/use-form-options";
import { resolvePaymentTermFromInput } from "../utils/payment-term";
import { CustomerForm, type CustomerFormData } from "./components/customer-form";

export default function CreateCustomerPage() {
	const navigate = useNavigate();
	const { employeeOptions, customerOptions } = useFormOptions();

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
		const registerDateIso = toUtcIsoPreferNowIfToday(data.registerDate);
		if (!registerDateIso) {
			toast.error("Invalid register date");
			return;
		}
		const { paymentTerm, error: paymentTermError } = resolvePaymentTermFromInput({
			paymentTerm: data.paymentTerm,
			startDate: data.startDate,
		});
		if (paymentTermError) {
			toast.error(paymentTermError);
			return;
		}

		const referredById = data.referredById && data.referredById !== "none" ? data.referredById : undefined;

		const payload: CreateCustomer = {
			registerDate: new Date(registerDateIso),
			name: data.name,
			status: true,
			referredById,
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
