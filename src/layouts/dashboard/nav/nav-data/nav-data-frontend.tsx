import { Icon } from "@/core/components/icon";
import type { NavProps } from "@/core/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		items: [
			{
				title: "Dashboard",
				path: "/",
				icon: <Icon icon="lucide:layout-dashboard" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Customer",
				path: "/dashboard/customers",
				icon: <Icon icon="lucide:users" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Employee",
				path: "/dashboard/employees",
				icon: <Icon icon="lucide:id-card" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Invoice",
				path: "/dashboard/invoice",
				icon: <Icon icon="lucide:file-text" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Product",
				path: "/dashboard/products",
				icon: <Icon icon="lucide:gift" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Coupon",
				path: "/dashboard/coupons",
				icon: <Icon icon="lucide:ticket" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Loan",
				path: "/dashboard/loan",
				icon: <Icon icon="lucide:clipboard-list" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Equipment",
				path: "/dashboard/equipment",
				icon: <Icon icon="lucide:wrench" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Reports",
				path: "/dashboard/reports",
				icon: <Icon icon="lucide:file-bar-chart" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Settings",
				path: "/dashboard/settings",
				icon: <Icon icon="lucide:settings" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			// {
			// 	title: "Audit Log",
			// 	path: "/dashboard/audit-log",
			// 	icon: <Icon icon="lucide:history" size="24" />,
			// 	roles: ["SUPER_ADMIN"],
			// },
		],
	},
];

export const newActions = [
	{
		title: "Customers",
		items: [{ title: "Create Cash Sale" }, { title: "Create Invoice" }, { title: "Create Receipt" }],
	},
	{
		title: "Vendors",
		items: [{ title: "Create Cash Purchase" }, { title: "Create Bill" }, { title: "Create Payment" }],
	},
	{
		title: "Accounting",
		items: [
			{ title: "Create Journal" },
			{ title: "Create Cash Transaction" },
			{ title: "Create Cash Revenue" },
			{ title: "Create Cash Expense" },
		],
	},
];
