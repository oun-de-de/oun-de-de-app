import { useMemo } from "react";
import { DefaultForm, type DefaultFormData, type FormFieldConfig } from "@/core/components/common";
import type { CreateCustomer } from "@/core/types/customer";
import type { Vehicle } from "@/core/types/vehicle";
import { CUSTOMER_FIELDS } from "../constants/customer-fields";
import { VehicleListField } from "./vehicle-list-field";

export type CustomerFormData = DefaultFormData & {
	registerDate: string;
	name: string;
	status: boolean;
	referredById?: string;
	warehouseId: string;
	memo: string;
	profileUrl: string;
	shopBannerUrl: string;
	employeeId: string;
	telephone: string;
	email: string;
	geography: string;
	address: string;
	location: string;
	map: string;
	billingAddress: string;
	deliveryAddress: string;
	vehicles?: CreateCustomer["vehicles"] | Vehicle[];
	paymentTerm?: string | number | null;
	startDate?: string;
};

type CustomerFormProps = {
	onSubmit?: (data: CustomerFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: CustomerFormData;
	mode?: "create" | "edit";
	showTitle?: boolean;
	employeeOptions?: { label: string; value: string }[];
	customerOptions?: { label: string; value: string }[];
	formResetKey?: string;
};

export function CustomerForm({
	onSubmit,
	onCancel,
	defaultValues,
	mode = "create",
	showTitle = true,
	employeeOptions = [],
	customerOptions = [],
	formResetKey,
}: CustomerFormProps) {
	const title = mode === "create" ? "Add Customer" : "Edit Customer";

	const fields = useMemo<FormFieldConfig[]>(() => {
		return CUSTOMER_FIELDS.filter((field) => !(mode === "create" && field.name === "status"))
			.map((field) => {
				if (field.name === "registerDate") {
					return { ...field, required: mode === "create", disabled: mode === "edit" };
				}
				if (field.name === "employeeId") {
					return { ...field, options: employeeOptions };
				}
				if (field.name === "referredById") {
					return { ...field, options: customerOptions };
				}
				return field;
			})
			.concat([
				{
					name: "vehicles",
					label: "Vehicles",
					type: "custom",
					component: <VehicleListField />,
					className: "col-span-2",
				},
			]);
	}, [customerOptions, employeeOptions, mode]);

	return (
		<DefaultForm<CustomerFormData>
			title={title}
			fields={fields}
			onSubmit={onSubmit}
			onCancel={onCancel}
			defaultValues={defaultValues}
			submitLabel={mode === "create" ? "Create" : "Save"}
			variant="default"
			inputVariant="default"
			inputSize="md"
			columns={2}
			showTitle={showTitle}
			resetKey={formResetKey}
		/>
	);
}
