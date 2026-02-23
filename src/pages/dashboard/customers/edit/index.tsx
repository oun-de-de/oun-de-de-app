import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import type { CreateVehicle, Vehicle } from "@/core/types/vehicle";
import { Separator } from "@/core/ui/separator";
import { Text } from "@/core/ui/typography";
import type { CustomerFormData } from "../create/components/customer-form";
import { CustomerForm } from "../create/components/customer-form";
import { useCreateCustomerVehicles } from "../hooks/use-create-customer-vehicles";
import { useGetCustomer } from "../hooks/use-get-customer";
import { useGetCustomerVehicles } from "../hooks/use-get-vehicles";
import { useUpdateCustomerInfo } from "../hooks/use-update-customer-info";
import { mapCustomerFormToUpdatePayload } from "../utils/map-customer-form-to-update-payload";
import { ProductSettingsForm } from "./components/product-settings-form";
import { WarehouseSettingsForm } from "./components/warehouse-settings-form";
import { useCustomerDefaults } from "./hooks/use-customer-defaults";
import { useFormOptions } from "./hooks/use-form-options";

export default function CustomerEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const { data: customer, isLoading: isLoadingCustomer } = useGetCustomer(id);
	const { data: vehicles } = useGetCustomerVehicles(id);
	const { employeeOptions, customerOptions } = useFormOptions();
	const { mutateAsync: updateCustomerInfo } = useUpdateCustomerInfo(id, { showSuccessToast: false });
	const { mutateAsync: createCustomerVehicles } = useCreateCustomerVehicles(id);

	const defaultValues = useCustomerDefaults(customer, vehicles);
	const formKey = useMemo(() => {
		const vehicleSnapshot = (vehicles || [])
			.map((vehicle) => `${vehicle.id}:${vehicle.vehicleType}:${vehicle.licensePlate}`)
			.join("|");

		return `customer-form-${customer?.id || "unknown"}-${customer?.name || ""}-${customer?.registerDate || ""}-${vehicleSnapshot}`;
	}, [customer?.id, customer?.name, customer?.registerDate, vehicles]);

	const handleSubmit = async (formData: CustomerFormData) => {
		const customerPayload = mapCustomerFormToUpdatePayload(formData);
		await updateCustomerInfo(customerPayload);

		const newVehicles: CreateVehicle[] = Array.isArray(formData.vehicles)
			? (formData.vehicles as Vehicle[])
					.filter((vehicle) => !vehicle.id && vehicle.vehicleType && vehicle.licensePlate)
					.map((vehicle) => ({
						vehicleType: vehicle.vehicleType,
						licensePlate: vehicle.licensePlate,
					}))
			: [];

		if (newVehicles.length > 0) {
			await createCustomerVehicles(newVehicles);
		}

		toast.success("Customer updated successfully");
	};

	if (isLoadingCustomer) {
		return <div className="p-6">Loading...</div>;
	}

	if (!customer) {
		return <div className="p-6">Customer not found</div>;
	}

	return (
		<div className="flex flex-col h-full p-6 gap-6 overflow-auto flex-1">
			{/* Customer Form */}
			{/* Header */}
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Edit Customer</Text>
			</div>
			{/* Form */}
			<div className="flex-1">
				<div className="w-full">
					<CustomerForm
						key={formKey}
						onSubmit={handleSubmit}
						onCancel={() => navigate("/dashboard/customers")}
						mode="edit"
						showTitle={false}
						defaultValues={defaultValues}
						employeeOptions={employeeOptions}
						customerOptions={customerOptions}
					/>
				</div>
			</div>

			<Separator className="my-2" />

			{/* Product Settings */}
			<ProductSettingsForm />

			<Separator className="my-2" />

			{/* Warehouse Settings */}
			<WarehouseSettingsForm customerId={id} currentWarehouseId={customer.warehouseId} />
		</div>
	);
}
