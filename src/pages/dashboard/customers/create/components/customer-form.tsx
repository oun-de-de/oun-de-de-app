import { DefaultForm, type DefaultFormData } from "@/core/components/common";
import { CUSTOMER_FIELDS } from "../constants/customer-fields";

type CustomerFormProps = {
	onSubmit?: (data: DefaultFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: DefaultFormData;
	mode?: "create" | "edit";
	showTitle?: boolean;
};

export function CustomerForm({
	onSubmit,
	onCancel,
	defaultValues,
	mode = "create",
	showTitle = true,
}: CustomerFormProps) {
	const title = mode === "create" ? "Add Customer" : "Edit Customer";

	return (
		<DefaultForm
			title={title}
			fields={CUSTOMER_FIELDS}
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
