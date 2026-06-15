export const COUPON_QUERY_KEYS = {
	all: ["coupons"] as const,
	list: (params?: Record<string, unknown>) => [...COUPON_QUERY_KEYS.all, "list", params ?? {}] as const,
	detail: (couponId: string | undefined) => [...COUPON_QUERY_KEYS.all, "detail", couponId ?? ""] as const,
	weightRecords: (couponId: string | undefined) => [...COUPON_QUERY_KEYS.detail(couponId), "weight-records"] as const,
};
