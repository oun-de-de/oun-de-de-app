import type { FormFieldConfig } from "@/core/components/common";

const UNIT_TYPE_OPTIONS = [
	{ label: "Count", value: "count" },
	{ label: "Weight", value: "weight" },
	{ label: "Volume", value: "volume" },
	{ label: "Length", value: "length" },
];

const PRICE_RULE_TYPE_OPTIONS = [
	{ label: "Discount", value: "discount" },
	{ label: "Markup", value: "markup" },
	{ label: "Fixed", value: "fixed" },
];

export const SETTINGS_FIELDS: Record<string, FormFieldConfig[]> = {
	Unit: [
		{ name: "name", label: "Name", type: "text", placeholder: "Enter unit name", required: true },
		{ name: "descr", label: "Description", type: "text", placeholder: "Enter description" },
		{
			name: "type",
			label: "Type",
			type: "select",
			options: UNIT_TYPE_OPTIONS,
			required: true,
		},
	],
	UOM: [
		{ name: "name", label: "Name", type: "text", placeholder: "Enter UOM name", required: true },
		{ name: "code", label: "Code", type: "text", placeholder: "Enter code" },
		{ name: "baseUnit", label: "Base Unit", type: "text", placeholder: "Enter base unit" },
		{ name: "conversionRate", label: "Conversion Rate", type: "number", placeholder: "1" },
		{ name: "isActive", label: "Active", type: "switch", defaultValue: true },
	],
	Category: [
		{ name: "name", label: "Name", type: "text", placeholder: "Enter category name", required: true },
		{ name: "code", label: "Code", type: "text", placeholder: "Enter code" },
		{ name: "description", label: "Description", type: "text", placeholder: "Enter description" },
		{ name: "isActive", label: "Active", type: "switch", defaultValue: true },
	],
	Group: [
		{ name: "name", label: "Name", type: "text", placeholder: "Enter group name", required: true },
		{ name: "code", label: "Code", type: "text", placeholder: "Enter code" },
		{ name: "isActive", label: "Active", type: "switch", defaultValue: true },
	],
	Brand: [
		{ name: "name", label: "Name", type: "text", placeholder: "Enter brand name", required: true },
		{ name: "code", label: "Code", type: "text", placeholder: "Enter code" },
		{ name: "description", label: "Description", type: "text", placeholder: "Enter description" },
		{ name: "isActive", label: "Active", type: "switch", defaultValue: true },
	],
	Rank: [
		{ name: "name", label: "Name", type: "text", placeholder: "Enter rank name", required: true },
		{ name: "level", label: "Level", type: "number", placeholder: "1" },
		{ name: "isActive", label: "Active", type: "switch", defaultValue: true },
	],
	"Price Rule": [
		{ name: "name", label: "Name", type: "text", placeholder: "Enter rule name", required: true },
		{
			name: "type",
			label: "Type",
			type: "select",
			options: PRICE_RULE_TYPE_OPTIONS,
		},
		{ name: "value", label: "Value", type: "number", placeholder: "0" },
		{ name: "isActive", label: "Active", type: "switch", defaultValue: true },
	],
	Warehouse: [
		{ name: "name", label: "Name", type: "text", placeholder: "Enter warehouse name", required: true },
		{ name: "descr", label: "Description", type: "text", placeholder: "Enter description" },
		{ name: "location", label: "Location", type: "text", placeholder: "Enter location" },
	],
};

// Default fields for unknown types
export const DEFAULT_FIELDS: FormFieldConfig[] = [
	{ name: "name", label: "Name", type: "text", placeholder: "Enter name", required: true },
	{ name: "code", label: "Code", type: "text", placeholder: "Enter code" },
	{ name: "isActive", label: "Active", type: "switch", defaultValue: true },
];
