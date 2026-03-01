import type { FormFieldConfig } from "@/core/components/common";

export const CREATE_EMPLOYEE_FIELDS: FormFieldConfig[] = [
	{
		name: "username",
		label: "Username",
		type: "text",
		required: true,
		placeholder: "Enter username",
	},
	{
		name: "password",
		label: "Password",
		type: "password",
		required: true,
		placeholder: "Enter password",
	},
	{
		name: "reEnteredPassword",
		label: "Confirm Password",
		type: "password",
		required: true,
		placeholder: "Re-enter password",
	},
];

export const EMPLOYEE_FIELDS: FormFieldConfig[] = [
	{
		name: "username",
		label: "Username",
		type: "text",
		disabled: true,
	},
	{
		name: "firstName",
		label: "First Name",
		type: "text",
		placeholder: "Enter first name",
	},
	{
		name: "lastName",
		label: "Last Name",
		type: "text",
		placeholder: "Enter last name",
	},
];
