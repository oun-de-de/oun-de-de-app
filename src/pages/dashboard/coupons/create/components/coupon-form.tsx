import { useMemo } from "react";
import type { ReactNode } from "react";
import { DefaultForm, type DefaultFormData, type FormFieldConfig } from "@/core/components/common";
import { COUPON_FIELDS } from "../constants/coupon-fields";

type CouponFormProps = {
	onSubmit?: (data: DefaultFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: DefaultFormData;
	mode?: "create" | "edit";
	showTitle?: boolean;
	employeeOptions?: { label: string; value: string }[];
	vehicleOptions?: { label: string; value: string }[];
	weightRecordsComponent?: ReactNode;
};

export function CouponForm({
	onSubmit,
	onCancel,
	defaultValues,
	mode = "create",
	showTitle = true,
	employeeOptions = [],
	vehicleOptions = [],
	weightRecordsComponent,
}: CouponFormProps) {
	const title = mode === "create" ? "Add Coupon" : "Edit Coupon";

	const fields = useMemo<FormFieldConfig[]>(() => {
		return COUPON_FIELDS.map((field) => {
			if (field.name === "employeeId") {
				return { ...field, options: employeeOptions };
			}
			if (field.name === "vehicleId") {
				return { ...field, options: vehicleOptions };
			}
			if (field.name === "weightRecordsBuilder") {
				return { ...field, component: weightRecordsComponent };
			}
			return field;
		});
	}, [employeeOptions, vehicleOptions, weightRecordsComponent]);

	return (
		<DefaultForm
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
		/>
	);
}
