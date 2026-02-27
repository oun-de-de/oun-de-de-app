import type { FormFieldConfig } from "@/core/components/common";
import { formatDateToYYYYMMDD } from "@/core/utils/date-utils";

export const COUPON_FIELDS: FormFieldConfig[] = [
	{
		name: "date",
		label: "Date",
		type: "date",
		required: true,
		defaultValue: formatDateToYYYYMMDD(new Date()),
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
	{
		name: "couponNo",
		label: "Coupon No",
		type: "number",
		placeholder: "Optional coupon number",
	},
	{
		name: "couponId",
		label: "Coupon ID",
		type: "number",
		placeholder: "Optional legacy coupon ID",
	},
	{
		name: "accNo",
		label: "Accounting No",
		type: "text",
		placeholder: "Optional accounting reference",
	},
	{
		name: "delAccNo",
		label: "Delivery Accounting No",
		type: "text",
		placeholder: "Optional delivery accounting number",
	},
	{
		name: "delDate",
		label: "Delivery Date",
		type: "date",
	},
	{
		name: "weightRecordsBuilder",
		label: "Weight Records",
		type: "custom",
		component: null,
		className: "md:col-span-2",
	},
];
