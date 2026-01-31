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
				title: "New Sale",
				path: "/sale/new/cash-sale",
				icon: <Icon icon="lucide:shopping-cart" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Customers",
				path: "/dashboard/customers",
				icon: <Icon icon="lucide:users" size="24" />,
				roles: ["SUPER_ADMIN"],
				actions: [
					{
						title: "Create Customer",
						path: "/dashboard/customers/create",
					},
					{
						title: "Create Cash Sale",
					},
					{
						title: "Create Invoice",
					},
					{
						title: "Create Receipt",
					},
				],
			},
			{
				title: "Vendors",
				path: "/dashboard/vendors",
				icon: <Icon icon="lucide:truck" size="24" />,
				roles: ["SUPER_ADMIN"],
				actions: [
					{
						title: "Create Vendor",
					},
					{
						title: "Create Cash Purchase",
					},
					{
						title: "Create Bill",
					},
					{
						title: "Create Payment",
					},
				],
			},
			{
				title: "Product/Service",
				path: "/dashboard/products",
				icon: <Icon icon="lucide:gift" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
			{
				title: "Borrow",
				path: "/dashboard/borrow",
				icon: <Icon icon="lucide:clipboard-list" size="24" />,
				roles: ["SUPER_ADMIN"],
				actions: [
					{
						title: "New Borrowing",
						path: "/dashboard/borrow/new",
					},
					{
						title: "Payment",
						path: "/dashboard/borrow/payment",
					},
				],
			},
			{
				title: "Accounting",
				path: "/dashboard/accounting",
				icon: <Icon icon="lucide:scale" size="24" />,
				roles: ["SUPER_ADMIN"],
				actions: [
					{
						title: "Create Journal",
					},
					{
						title: "Create Cash Transaction",
					},
					{
						title: "Create Cash Revenue",
					},
					{
						title: "Create Case Expense",
					},
					{
						title: "Chart Of Account",
					},
				],
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
			{
				title: "Audit Log",
				path: "/dashboard/audit-log",
				icon: <Icon icon="lucide:history" size="24" />,
				roles: ["SUPER_ADMIN"],
			},
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
