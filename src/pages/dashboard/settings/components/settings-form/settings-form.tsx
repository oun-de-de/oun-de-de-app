import { DefaultForm, type DefaultFormData } from "@/core/components/common";
import { DEFAULT_FIELDS, SETTINGS_FIELDS } from "./setting-fields";

type SettingsFormProps = {
	activeItem: string;
	onSubmit?: (data: DefaultFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: DefaultFormData;
	mode?: "create" | "edit";
	showTitle?: boolean;
};

export function SettingsForm({
	activeItem,
	onSubmit,
	onCancel,
	defaultValues,
	mode = "create",
	showTitle = true,
}: SettingsFormProps) {
	const fields = SETTINGS_FIELDS[activeItem] || DEFAULT_FIELDS;
	const title = mode === "create" ? `Add ${activeItem}` : `Edit ${activeItem}`;

	return (
		<DefaultForm
			title={title}
			fields={fields}
			onSubmit={onSubmit}
			onCancel={onCancel}
			defaultValues={defaultValues}
			submitLabel={mode === "create" ? "Create" : "Save"}
			variant="compact"
			inputVariant="default"
			inputSize="md"
			columns={2}
			showTitle={showTitle}
		/>
	);
}
