import { DefaultForm, type DefaultFormData } from "@/core/components/common";
import type { UnitType } from "@/core/types/setting";
import { DEFAULT_FIELDS, SETTINGS_FIELDS } from "./setting-fields";

type SettingsFormProps = {
	activeItem: string;
	onSubmit?: (data: DefaultFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: DefaultFormData;
	mode?: "create" | "edit";
	showTitle?: boolean;
};

const UNIT_TYPES = new Set<UnitType>(["count", "length", "weight", "volume", "time"]);

const normalizeUnitType = (value: unknown): UnitType | "" => {
	if (typeof value !== "string") return "";
	const normalized = value.toLowerCase() as UnitType;
	return UNIT_TYPES.has(normalized) ? normalized : "";
};

export function SettingsForm({
	activeItem,
	onSubmit,
	onCancel,
	defaultValues,
	mode = "create",
	showTitle = true,
}: SettingsFormProps) {
	const normalizedType = activeItem === "Unit" ? normalizeUnitType(defaultValues?.type) : "";
	const fields = (SETTINGS_FIELDS[activeItem] || DEFAULT_FIELDS).map((field) => {
		if (activeItem !== "Unit" || field.name !== "type" || !field.options) {
			return field;
		}

		return {
			...field,
			options: field.options.map((option) => ({
				...option,
				disabled: mode === "edit" && normalizedType !== "" && option.value === normalizedType,
			})),
		};
	});
	const title = mode === "create" ? `Add ${activeItem}` : `Edit ${activeItem}`;
	const resolvedDefaultValues =
		activeItem === "Unit" && normalizedType ? { ...defaultValues, type: normalizedType } : defaultValues;

	return (
		<DefaultForm
			title={title}
			fields={fields}
			onSubmit={onSubmit}
			onCancel={onCancel}
			defaultValues={resolvedDefaultValues}
			submitLabel={mode === "create" ? "Create" : "Save"}
			variant="compact"
			inputVariant="default"
			inputSize="lg"
			columns={1}
			className="gap-4 space-y-4"
			showTitle={showTitle}
		/>
	);
}
