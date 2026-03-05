import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import type { CustomerDetail } from "@/core/types/customer";
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
const LOADING_INDICATORS = ["Loading settings", "Loading warehouses"] as const;
const SCROLL_POLL_MS = 200;
const SCROLL_MAX_WAIT_MS = 3000;
const CUSTOMERS_PATH = "/dashboard/customers";
const PRODUCT_SETTINGS_ANCHOR_ID = "product-settings";
const WAREHOUSE_SETTINGS_ANCHOR_ID = "warehouse-settings";

type CustomerEditLocationState = {
	scrollTo?: string;
};

const getFormResetKey = (customer?: CustomerDetail, vehicles?: Vehicle[]) => {
	const vehicleSnapshot =
		vehicles?.map((vehicle) => `${vehicle.id}:${vehicle.vehicleType}:${vehicle.licensePlate}`).join(",") ?? "";

	return [
		customer?.id ?? "",
		customer?.name ?? "",
		customer?.registerDate ?? "",
		customer?.paymentTerm?.duration ?? "",
		customer?.paymentTerm?.startDate ?? "",
		vehicleSnapshot,
	].join("|");
};

const splitVehicles = (vehicles: CustomerFormData["vehicles"] = []) => {
	const formVehicles = vehicles;

	return {
		newVehicles: formVehicles
			.filter((vehicle) => !isExistingVehicle(vehicle) && vehicle.vehicleType && vehicle.licensePlate)
			.map((vehicle) => ({ vehicleType: vehicle.vehicleType, licensePlate: vehicle.licensePlate })),
		existingVehicles: formVehicles.flatMap((vehicle) =>
			isExistingVehicle(vehicle) && vehicle.vehicleType && vehicle.licensePlate
				? [{ id: vehicle.id, vehicleType: vehicle.vehicleType, licensePlate: vehicle.licensePlate }]
				: [],
		),
	};
};

const scrollToAnchorWhenReady = (container: HTMLDivElement, anchorId: string) => {
	let elapsed = 0;
	const pollId = setInterval(() => {
		elapsed += SCROLL_POLL_MS;
		const target = document.getElementById(anchorId);
		const stillLoading = LOADING_INDICATORS.some((text) => container.textContent?.includes(text));

		if ((!target || stillLoading) && elapsed < SCROLL_MAX_WAIT_MS) return;

		clearInterval(pollId);
		if (!target) return;

		const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
		container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
	}, SCROLL_POLL_MS);

	return () => clearInterval(pollId);
};

export default function CustomerEditPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const containerRef = useRef<HTMLDivElement>(null);
	const locationState = location.state as CustomerEditLocationState | null;
	const scrollTarget = locationState?.scrollTo;

	const { data: customer, isLoading } = useGetCustomer(id);
	const { data: vehicles } = useGetCustomerVehicles(id);
	const { employeeOptions, customerOptions } = useFormOptions();
	const { mutateAsync: updateCustomerInfo } = useUpdateCustomerInfo(id, { showSuccessToast: false });
	const { mutateAsync: createCustomerVehicles } = useCreateCustomerVehicles(id);
	const { mutateAsync: updateCustomerVehicles } = useUpdateCustomerVehicles(id);

	const defaultValues = useCustomerDefaults(customer, vehicles);
	const formResetKey = useMemo(() => getFormResetKey(customer, vehicles), [customer, vehicles]);

	useEffect(() => {
		const container = containerRef.current;
		if (isLoading || !customer || !scrollTarget || !container) return;

		return scrollToAnchorWhenReady(container, scrollTarget);
	}, [customer, isLoading, scrollTarget]);

	const handleSubmit = useCallback(
		async (formData: CustomerFormData) => {
			const shouldSkipPaymentTerm = !isPaymentTermChanged(formData, customer?.paymentTerm);

			if (!shouldSkipPaymentTerm) {
				const { error } = resolvePaymentTermFromInput(formData);
				if (error) {
					toast.error(error);
					return;
				}
			}

			const payload = mapCustomerFormToUpdatePayload(formData, { skipPaymentTerm: shouldSkipPaymentTerm });
			await updateCustomerInfo(payload);

			const { newVehicles, existingVehicles } = splitVehicles(formData.vehicles);

			if (newVehicles.length > 0) await createCustomerVehicles(newVehicles);
			if (existingVehicles.length > 0) await updateCustomerVehicles(existingVehicles);

			toast.success("Customer updated successfully");
			navigate(CUSTOMERS_PATH);
		},
		[customer?.paymentTerm, updateCustomerInfo, createCustomerVehicles, updateCustomerVehicles, navigate],
	);

	if (isLoading) return <div className="p-6">Loading...</div>;
	if (!customer) return <div className="p-6">Customer not found</div>;

	return (
		<div ref={containerRef} className="flex flex-col h-full p-6 gap-6 overflow-auto flex-1">
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Edit Customer</Text>
			</div>

			<div className="flex-1 w-full">
				<CustomerForm
					onSubmit={handleSubmit}
					onCancel={() => navigate(CUSTOMERS_PATH)}
					mode="edit"
					showTitle={false}
					defaultValues={defaultValues}
					employeeOptions={employeeOptions}
					customerOptions={customerOptions}
					formResetKey={formResetKey}
				/>
			</div>

			<Separator className="my-2" />
			<ProductSettingsForm anchorId={PRODUCT_SETTINGS_ANCHOR_ID} />
			<Separator className="my-2" />
			<WarehouseSettingsForm
				anchorId={WAREHOUSE_SETTINGS_ANCHOR_ID}
				customerId={id}
				currentWarehouseId={customer.warehouse?.id}
			/>

			<div className="min-h-[50vh]" aria-hidden />
		</div>
	);
}
