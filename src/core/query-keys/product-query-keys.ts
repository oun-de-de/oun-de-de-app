export const PRODUCT_QUERY_KEYS = {
	all: ["products"] as const,
	list: () => [...PRODUCT_QUERY_KEYS.all, "list"] as const,
	detail: (productId: string | undefined) => [...PRODUCT_QUERY_KEYS.all, "detail", productId ?? ""] as const,
};
