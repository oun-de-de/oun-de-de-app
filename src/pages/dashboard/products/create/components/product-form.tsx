import { useMemo } from "react";
import { DefaultForm, type DefaultFormData, type FormFieldConfig } from "@/core/components/common";
import type { CreateProductRequest, UpdateProduct } from "@/core/types/product";
import { CREATE_PRODUCT_FIELDS, PRODUCT_FIELDS } from "../constants/product-fields";

export type ProductFormData = DefaultFormData & Partial<CreateProductRequest & UpdateProduct>;

type ProductFormProps = {
	onSubmit?: (data: ProductFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: ProductFormData;
	mode?: "create" | "edit";
	showTitle?: boolean;
	unitOptions?: { label: string; value: string }[];
};

export function ProductForm({
	onSubmit,
	onCancel,
	defaultValues,
	mode = "create",
	showTitle = true,
	unitOptions = [],
}: ProductFormProps) {
	const title = mode === "create" ? "Add Product" : "Edit Product";

	const fields = useMemo<FormFieldConfig[]>(() => {
		const baseFields = mode === "create" ? CREATE_PRODUCT_FIELDS : PRODUCT_FIELDS;
		return baseFields.map((field) => {
			if (field.name === "unitId") {
				return { ...field, options: unitOptions };
			}
			return field;
		});
	}, [mode, unitOptions]);

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
