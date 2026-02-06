import { useMemo } from "react";
import { DefaultForm, type DefaultFormData, type FormFieldConfig } from "@/core/components/common";
import type { CreateProduct } from "@/core/types/product";
import { PRODUCT_FIELDS } from "../constants/product-fields";
import { GenerateProductCodeButton } from "./generate-product-code-button";

export type ProductFormData = DefaultFormData & Partial<CreateProduct>;

type ProductFormProps = {
	onSubmit?: (data: ProductFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: ProductFormData;
	mode?: "create" | "edit";
	showTitle?: boolean;
};

export function ProductForm({
	onSubmit,
	onCancel,
	defaultValues,
	mode = "create",
	showTitle = true,
}: ProductFormProps) {
	const title = mode === "create" ? "Add Product" : "Edit Product";

	const fields = useMemo<FormFieldConfig[]>(() => {
		return PRODUCT_FIELDS.map((field) => {
			if (field.name === "refNo") {
				return { ...field, endAdornment: <GenerateProductCodeButton /> };
			}
			return field;
		});
	}, []);

	return (
		<DefaultForm<ProductFormData>
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
