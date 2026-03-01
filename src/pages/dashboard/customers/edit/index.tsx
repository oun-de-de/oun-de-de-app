import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import type { CreateVehicle, Vehicle } from "@/core/types/vehicle";
import { Separator } from "@/core/ui/separator";
import { Text } from "@/core/ui/typography";
import type { CustomerFormData } from "../create/components/customer-form";
import { CustomerForm } from "../create/components/customer-form";
import { useCreateCustomerVehicles } from "../hooks/use-create-customer-vehicles";
import { useFormOptions } from "../hooks/use-form-options";
import { useGetCustomer } from "../hooks/use-get-customer";
import { useGetCustomerVehicles } from "../hooks/use-get-vehicles";
import { useUpdateCustomerInfo } from "../hooks/use-update-customer-info";
import { useUpdateCustomerVehicles } from "../hooks/use-update-customer-vehicles";
import { mapCustomerFormToUpdatePayload } from "../utils/map-customer-form-to-update-payload";
import { isPaymentTermChanged, resolvePaymentTermFromInput } from "../utils/payment-term";
import { ProductSettingsForm } from "./components/product-settings-form";
import { WarehouseSettingsForm } from "./components/warehouse-settings-form";
import { useCustomerDefaults } from "./hooks/use-customer-defaults";

const isExistingVehicle = (vehicle: CreateVehicle | Vehicle): vehicle is Vehicle => "id" in vehicle;

export default function CustomerEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const { data: customer, isLoading } = useGetCustomer(id);
	const { data: vehicles } = useGetCustomerVehicles(id);
	const { employeeOptions, customerOptions } = useFormOptions();
	const { mutateAsync: updateCustomerInfo } = useUpdateCustomerInfo(id, { showSuccessToast: false });
	const { mutateAsync: createCustomerVehicles } = useCreateCustomerVehicles(id);
	const { mutateAsync: updateCustomerVehicles } = useUpdateCustomerVehicles(id);

	const defaultValues = useCustomerDefaults(customer, vehicles);

	// Stable deps to avoid reset on React Query refetch
	const cId = customer?.id;
	const cName = customer?.name;
	const cDate = customer?.registerDate;
	const cPtDur = customer?.paymentTerm?.duration;
	const cPtDate = customer?.paymentTerm?.startDate;
	const vSnap = vehicles?.map((v) => `${v.id}:${v.vehicleType}:${v.licensePlate}`).join(",") ?? "";
	const formResetKey = useMemo(
		() => [cId ?? "", cName ?? "", cDate ?? "", cPtDur ?? "", cPtDate ?? "", vSnap].join("|"),
		[cId, cName, cDate, cPtDur, cPtDate, vSnap],
	);

	const handleSubmit = async (formData: CustomerFormData) => {
		const ptChanged = isPaymentTermChanged(formData, customer?.paymentTerm);

		if (ptChanged) {
			const { error } = resolvePaymentTermFromInput(formData);
			if (error) {
				toast.error(error);
				return;
			}
		}

		const payload = mapCustomerFormToUpdatePayload(formData, { skipPaymentTerm: !ptChanged });
		await updateCustomerInfo(payload);

		const formVehicles = Array.isArray(formData.vehicles) ? formData.vehicles : [];

		const newVehicles: CreateVehicle[] = formVehicles
			.filter((v) => !isExistingVehicle(v) && v.vehicleType && v.licensePlate)
			.map((v) => ({ vehicleType: v.vehicleType, licensePlate: v.licensePlate }));

		const existingVehicles = formVehicles
			.filter((v): v is Vehicle => isExistingVehicle(v) && !!v.vehicleType && !!v.licensePlate)
			.map((v) => ({ id: v.id, vehicleType: v.vehicleType, licensePlate: v.licensePlate }));

		if (newVehicles.length > 0) await createCustomerVehicles(newVehicles);
		if (existingVehicles.length > 0) await updateCustomerVehicles(existingVehicles);

		toast.success("Customer updated successfully");
		navigate("/dashboard/customers");
	};

	if (isLoading) return <div className="p-6">Loading...</div>;
	if (!customer) return <div className="p-6">Customer not found</div>;

	return (
		<div className="flex flex-col h-full p-6 gap-6 overflow-auto flex-1">
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Edit Customer</Text>
			</div>

			<div className="flex-1">
				<div className="w-full">
					<CustomerForm
						onSubmit={handleSubmit}
						onCancel={() => navigate("/dashboard/customers")}
						mode="edit"
						showTitle={false}
						defaultValues={defaultValues}
						employeeOptions={employeeOptions}
						customerOptions={customerOptions}
						formResetKey={formResetKey}
					/>
				</div>
			</div>

			<Separator className="my-2" />
			<ProductSettingsForm />
			<Separator className="my-2" />
			<WarehouseSettingsForm customerId={id} currentWarehouseId={customer.warehouse?.id} />
		</div>
	);
}
