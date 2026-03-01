import type { FormFieldConfig } from "@/core/components/common";

export const CREATE_PRODUCT_FIELDS: FormFieldConfig[] = [
	{
		name: "name",
		label: "Name",
		type: "text",
		required: true,
		placeholder: "Enter product name",
		className: "col-span-2",
	},
	{
		name: "unitId",
		label: "Unit",
		type: "select",
		required: true,
		options: [],
		placeholder: "Select unit",
	},
	{
		name: "defaultPrice",
		label: "Default Price",
		type: "number",
		required: false,
		placeholder: "0.00",
	},
	{
		name: "defaultQuantity",
		label: "Default Quantity",
		type: "number",
		required: false,
		placeholder: "0",
	},
];

export const PRODUCT_FIELDS: FormFieldConfig[] = [
	{
		name: "date",
		label: "Date",
		type: "date",
		required: true,
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
		name: "unitId",
		label: "Unit",
		type: "select",
		required: true,
		options: [],
		placeholder: "Select unit",
	},
	{
		name: "price",
		label: "Price",
		type: "number",
		required: true,
		placeholder: "0.00",
	},
	{
		name: "defaultQuantity",
		label: "Default Quantity",
		type: "number",
		required: false,
		placeholder: "0",
	},
	{
		name: "defaultPrice",
		label: "Default Price",
		type: "number",
		required: false,
		placeholder: "0.00",
	},
];
