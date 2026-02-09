import type { FormFieldConfig } from "@/core/components/common";

export const PRODUCT_FIELDS: FormFieldConfig[] = [
	{
		name: "date",
		label: "Date",
		type: "date",
		required: false,
		defaultValue: new Date().toISOString().split("T")[0],
	},
	{
		name: "refNo",
		label: "Ref No",
		type: "text",
		required: false,
		placeholder: "Enter reference number",
		pattern: {
			value: /^PRO\d{6}$/,
			message: "Ref No must be in format PROxxxxxx (e.g., PRO123456)",
		},
	},
	{
		name: "name",
		label: "Name",
		type: "text",
		required: false,
		placeholder: "Enter product name",
		className: "col-span-2",
	},
	{
		name: "quantity",
		label: "Quantity",
		type: "number",
		required: false,
		placeholder: "Enter quantity",
	},
	{
		name: "cost",
		label: "Cost",
		type: "number",
		required: false,
		placeholder: "0.00",
	},
	{
		name: "unit",
		label: "Unit",
		type: "text",
		required: false,
		placeholder: "Enter unit (e.g. pc, kg)",
	},
	{
		name: "price",
		label: "Price",
		type: "number",
		required: false,
		placeholder: "0.00",
	},
];
