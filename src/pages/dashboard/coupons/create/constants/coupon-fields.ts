import type { FormFieldConfig } from "@/core/components/common";

export const COUPON_FIELDS: FormFieldConfig[] = [
	{
		name: "date",
		label: "Date",
		type: "date",
		required: true,
		defaultValue: new Date().toISOString().split("T")[0],
	},
	{
		name: "vehicleId",
		label: "Vehicle",
		type: "select",
		required: true,
		options: [],
		placeholder: "Select vehicle",
	},
	{
		name: "driverName",
		label: "Driver Name",
		type: "text",
		required: true,
		placeholder: "Enter driver name",
	},
	{
		name: "employeeId",
		label: "Employee",
		type: "select",
		required: true,
		options: [],
		placeholder: "Select employee",
	},
	{
		name: "remark",
		label: "Remark",
		type: "textarea",
		placeholder: "Enter remarks or notes",
	},
];
