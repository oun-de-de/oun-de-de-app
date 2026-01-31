export type RouteMappingProps = {
	path: string;
	title: string;
};

export const ROUTE_TITLE_MAPPINGS = [
	// Specific route mappings from frontend routes
	{
		path: "/dashboard/sale/new",
		title: "Create Sale",
	},
	{
		path: "/dashboard/customers",
		title: "Customer Center",
	},
	{
		path: "/dashboard/customers/create",
		title: "Create Customer",
	},
	{
		path: "/dashboard/vendors",
		title: "Vendor Center",
	},
	{
		path: "/dashboard/products",
		title: "Product/Service Center",
	},
	{
		path: "/dashboard/accounting",
		title: "Accounting Center",
	},
	{
		path: "/dashboard/reports",
		title: "Reports",
	},
	{
		path: "/dashboard/settings",
		title: "Settings",
	},
	{
		path: "/dashboard/audit-log",
		title: "Audit Log",
	},
	{
		path: "/dashboard/borrow",
		title: "Borrow",
	},
	{
		path: "/dashboard/borrow/new",
		title: "New Borrow Center",
	},
	{
		path: "/dashboard/borrow/payment",
		title: "Borrow Payment Center",
	},

	// Nested routes that might be accessed
	{
		path: "/dashboard/reports/customer-list",
		title: "Customer List Report",
	},
	{
		path: "/dashboard/reports/sale-detail-by-customer",
		title: "Sale Detail By Customer",
	},
] as const satisfies readonly RouteMappingProps[];

export type RoutePath = (typeof ROUTE_TITLE_MAPPINGS)[number]["path"];
export type RouteTitle = (typeof ROUTE_TITLE_MAPPINGS)[number]["title"];

export const ROUTE_TITLE_MAP = Object.fromEntries(
	ROUTE_TITLE_MAPPINGS.map(({ path, title }) => [path, title] as const),
) as Record<RoutePath, RouteTitle>;

// Safe `hasOwn` helper for broader runtime support and type narrowing.
const hasOwn = <T extends object, K extends PropertyKey>(obj: T, key: K): key is Extract<K, keyof T> =>
	Object.hasOwn(obj, key);

// Remove query/hash so matching works for URLs like "/path?x=1#y".
const normalizePath = (raw: string) => raw.split(/[?#]/, 1)[0] || raw;

// Longest-first so more specific routes win (e.g. "/borrow/new" before "/borrow").
const SORTED_PATHS = [...ROUTE_TITLE_MAPPINGS].map((mapping) => mapping.path).sort((a, b) => b.length - a.length);

export const getRouteTitle = (rawPath: string): RouteTitle | undefined => {
	const path = normalizePath(rawPath);

	// 1) Exact match
	if (hasOwn(ROUTE_TITLE_MAP, path)) {
		return ROUTE_TITLE_MAP[path];
	}

	// 2) Prefix match for nested routes (e.g. "/vendors/123" -> "/vendors")
	for (const base of SORTED_PATHS) {
		if (path === base || path.startsWith(`${base}/`)) {
			return ROUTE_TITLE_MAP[base];
		}
	}

	return undefined;
};
