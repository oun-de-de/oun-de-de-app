export const CUSTOMER_QUERY_KEYS = {
	all: ["customers"] as const,
	list: (params?: Record<string, unknown>) => [...CUSTOMER_QUERY_KEYS.all, "list", params ?? {}] as const,
	detail: (customerId: string | undefined) => [...CUSTOMER_QUERY_KEYS.all, "detail", customerId ?? ""] as const,
	vehicles: (customerId: string | undefined) => [...CUSTOMER_QUERY_KEYS.detail(customerId), "vehicles"] as const,
	productSettings: (customerId: string | undefined) =>
		[...CUSTOMER_QUERY_KEYS.detail(customerId), "product-settings"] as const,
};
