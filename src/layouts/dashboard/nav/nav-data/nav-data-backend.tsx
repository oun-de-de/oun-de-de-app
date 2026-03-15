import { DB_MENU } from "@/_mock/assets_backup";
import { Icon } from "@/core/components/icon";
import type { NavItemDataProps, NavProps } from "@/core/components/nav";
import type { MenuTree } from "@/core/types/entity";
import { Badge } from "@/core/ui/badge";
import { convertFlatToTree } from "@/core/utils/tree";

const convertChildren = (children?: MenuTree[]): NavItemDataProps[] => {
	if (!children?.length) return [];

	return children.map((child) => ({
		title: child.name,
		path: child.path || "",
		icon: child.icon ? typeof child.icon === "string" ? <Icon icon={child.icon} size="24" /> : child.icon : null,
		caption: child.caption,
		info: child.info ? <Badge variant="default">{child.info}</Badge> : null,
		disabled: child.disabled,
		externalLink: child.externalLink,
		auth: child.auth,
		hidden: child.hidden,
		children: convertChildren(child.children),
	}));
};

const convert = (menuTree: MenuTree[]): NavProps["data"] => {
	return menuTree.map((item) => ({
		name: item.name,
		items: convertChildren(item.children),
	}));
};

export const backendNavData: NavProps["data"] = convert(convertFlatToTree(DB_MENU));

export const newActions = [
	{
		title: "Customers",
		items: [
			{ title: "Create Cash Sale", href: "/sale/new/cash-sale" },
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
			{ title: "Create Cash Transaction", href: "/dashboard/accounting-center/create" },
			{ title: "Create Cash Revenue", href: "/dashboard/accounting/create-revenue" },
			{ title: "Create Cash Expense", href: "/dashboard/accounting/create-expense" },
		],
	},
] as const;
