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
				path: "/dashboard/accounting-center",
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
		items: [
			// { title: "Create Cash Sale", href: "/sale/new/cash-sale" },
			{ title: "Create Invoice", href: "/dashboard/invoice" },
			{ title: "Create Receipt", href: "/dashboard/customers/create-receipt" },
		],
	},
	{
		title: "Vendors",
		items: [
			{ title: "Create Cash Purchase", href: "/dashboard/vendors" },
			{ title: "Create Bill", href: "/dashboard/vendors" },
			{ title: "Create Payment", href: "/dashboard/vendors" },
		],
	},
	{
		title: "Accounting",
		items: [
			{ title: "Create Journal", href: "/dashboard/accounting/create-journal" },
			{
				title: "Create Cash Transaction",
				href: "/dashboard/accounting/create-cash-transaction",
			},
			{
				title: "Create Cash Revenue",
				href: "/dashboard/accounting/create-revenue",
			},
			{
				title: "Create Cash Expense",
				href: "/dashboard/accounting/create-expense",
			},
		],
	},
] as const;
