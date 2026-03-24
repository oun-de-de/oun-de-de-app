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
				title: "Accounting",
				path: "/dashboard/accounting",
				icon: <Icon icon="lucide:wallet" size="24" />,
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
		],
	},
];

export const newActions = [
	{
		title: "Customers",
		items: [{ title: "Create Invoice", href: "/dashboard/invoice" }],
	},
	{
		title: "Accounting",
		items: [
			{ title: "Create Chart Account", href: "/dashboard/accounting/create-chart-account" },
			// Temporarily hidden until the backend exposes accounting entry endpoints.
			// { title: "Create Journal", href: "/dashboard/accounting/create-journal" },
			// { title: "Create Cash Transaction", href: "/dashboard/accounting/create-cash-transaction" },
			{ title: "Create Cash Revenue", href: "/dashboard/accounting/create-revenue" },
			{ title: "Create Cash Expense", href: "/dashboard/accounting/create-expense" },
		],
	},
] as const;
