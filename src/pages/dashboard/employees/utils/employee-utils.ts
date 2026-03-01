import type { Employee } from "@/core/types/employee";

export const FILTER_TYPE_OPTIONS = [{ value: "all", label: "All" }];

export const FILTER_FIELD_OPTIONS = [
	{ value: "username", label: "Username" },
	{ value: "firstName", label: "First Name" },
	{ value: "lastName", label: "Last Name" },
];

export const getEmployeeDisplayName = (employee: Pick<Employee, "username" | "firstName" | "lastName">) => {
	const fullName = `${employee.firstName} ${employee.lastName}`.trim();
	return fullName || employee.username;
};

export const getEmployeeSummaryStats = (employee: Employee | null) => {
	return [
		{
			label: "Username",
			value: employee?.username || "-",
			icon: "mdi:account-outline",
			color: "bg-blue-500",
		},
		{
			label: "First Name",
			value: employee?.firstName || "-",
			icon: "mdi:badge-account-outline",
			color: "bg-emerald-500",
		},
		{
			label: "Last Name",
			value: employee?.lastName || "-",
			icon: "mdi:card-account-details-outline",
			color: "bg-orange-500",
		},
		{
			label: "Display Name",
			value: employee ? getEmployeeDisplayName(employee) : "-",
			icon: "mdi:account-box-outline",
			color: "bg-slate-500",
		},
	];
};
