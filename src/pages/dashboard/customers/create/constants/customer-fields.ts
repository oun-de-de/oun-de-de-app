import type { FormFieldConfig } from "@/core/components/common";

export const CUSTOMER_FIELDS: FormFieldConfig[] = [
	{
		name: "registerDate",
		label: "Register Date",
		type: "date",
		required: true,
		defaultValue: new Date().toISOString().split("T")[0],
		helperText: "Customer registration date",
	},
	{
		name: "code",
		label: "Code",
		type: "text",
		required: true,
		placeholder: "Enter customer code",
	},
	{
		name: "name",
		label: "Name",
		type: "text",
		required: true,
		placeholder: "Enter customer name",
	},
	{
		name: "customerType",
		label: "Customer Type",
		type: "select",
		required: true,
		options: [
			{ label: "លក់ដុំ (ជាបន្តិច)", value: "wholesale_small" },
			{ label: "លក់រាយ", value: "retail" },
			{ label: "អតិថិជន VIP", value: "vip" },
		],
	},
	{
		name: "employeeId",
		label: "Employee",
		type: "select",
		required: true,
		options: [
			{ label: "Employee 1", value: "employee_1" },
			{ label: "Employee 2", value: "employee_2" },
			// Add employee options dynamically
		],
		placeholder: "Select employee",
	},
	{
		name: "defaultPrice",
		label: "Default Price",
		type: "select",
		options: [
			{ label: "Retail Price", value: "retail_price" },
			{ label: "Wholesale Price", value: "wholesale_price" },
			{ label: "Special Price", value: "special_price" },
		],
		defaultValue: "retail_price",
	},
	{
		name: "warehouse",
		label: "Warehouse",
		type: "select",
		options: [
			{ label: "Warehouse 1", value: "Warehouse 1" },
			{ label: "Warehouse 2", value: "Warehouse 2" },
			// Add warehouse options dynamically
		],
	},
	{
		name: "status",
		label: "Status",
		type: "switch",
		defaultValue: true,
		helperText: "Active/Inactive customer status",
	},
	{
		name: "telephone",
		label: "Telephone",
		type: "text",
		placeholder: "Enter phone number",
	},
	{
		name: "email",
		label: "Email",
		type: "text",
		placeholder: "Enter email address",
	},
	{
		name: "geography",
		label: "Geography",
		type: "text",
		placeholder: "Enter geography/region",
	},
	{
		name: "address",
		label: "Address",
		type: "textarea",
		placeholder: "Enter full address",
	},
	{
		name: "location",
		label: "Location",
		type: "text",
		placeholder: "Enter location details",
	},
	{
		name: "map",
		label: "Map URL",
		type: "text",
		placeholder: "Enter Google Maps link",
	},
	{
		name: "billingAddress",
		label: "Billing Address",
		type: "textarea",
		placeholder: "Enter billing address",
	},
	{
		name: "deliveryAddress",
		label: "Delivery Address",
		type: "textarea",
		placeholder: "Enter delivery address",
	},
	{
		name: "profileUrl",
		label: "Profile URL",
		type: "text",
		placeholder: "Enter profile image URL",
		helperText: "URL for customer profile image",
	},
	{
		name: "shopBannerUrl",
		label: "Shop Banner URL",
		type: "text",
		placeholder: "Enter shop banner image URL",
		helperText: "URL for shop banner image",
	},
	{
		name: "memo",
		label: "Memo",
		type: "textarea",
		placeholder: "Enter additional notes",
		helperText: "Additional notes or comments about the customer",
	},
];
