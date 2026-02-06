import type { FormFieldConfig } from "@/core/components/common";

export const PRODUCT_FIELDS: FormFieldConfig[] = [
	{
		name: "date",
		label: "Date",
		type: "date",
		required: true,
		defaultValue: new Date().toISOString().split("T")[0],
	},
	{
		name: "refNo",
		label: "Ref No",
		type: "text",
		required: true,
		placeholder: "Enter reference number",
		pattern: {
			value: /^PRO\d{6}$/,
			message: "Ref No must be in format PROxxxxxx (e.g., PRO123456)",
		},
		className: "w-full sm:w-[240px]",
	},
	{
		name: "name",
		label: "Name",
		type: "text",
		required: true,
		placeholder: "Enter product name",
		className: "col-span-2",
	},
	{
		name: "quantity",
		label: "Quantity",
		type: "number",
		required: true,
		placeholder: "Enter quantity",
	},
	{
		name: "cost",
		label: "Cost",
		type: "number",
		required: true,
		placeholder: "0.00",
	},
	{
		name: "price",
		label: "Price",
		type: "number",
		required: true,
		placeholder: "0.00",
	},
];
