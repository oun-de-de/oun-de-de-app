import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		items: [
			{
				title: "Dashboard",
				path: "/",
				icon: <Icon icon="lucide:layout-dashboard" size="24" />,
			},
			{
				title: "New Sale",
				path: "/dashboard/sale/new",
				icon: <Icon icon="lucide:shopping-cart" size="24" />,
			},
			{
				title: "Customers",
				path: "/dashboard/customers",
				icon: <Icon icon="lucide:users" size="24" />,
			},
			{
				title: "Vendors",
				path: "/dashboard/vendors",
				icon: <Icon icon="lucide:truck" size="24" />,
			},
			{
				title: "Product/Service",
				path: "/dashboard/products",
				icon: <Icon icon="lucide:gift" size="24" />,
			},
			{
				title: "Accounting",
				path: "/dashboard/accounting",
				icon: <Icon icon="lucide:scale" size="24" />,
			},
			{
				title: "Reports",
				path: "/dashboard/reports",
				icon: <Icon icon="lucide:file-bar-chart" size="24" />,
			},
			{
				title: "Settings",
				path: "/dashboard/settings",
				icon: <Icon icon="lucide:settings" size="24" />,
			},
			{
				title: "Audit Log",
				path: "/dashboard/audit-log",
				icon: <Icon icon="lucide:history" size="24" />,
			},
		],
	},
];
