import { COUPON_QUERY_KEYS } from "./coupon-query-keys";

describe("COUPON_QUERY_KEYS", () => {
	it("groups coupon cache entries under one stable root", () => {
		expect(COUPON_QUERY_KEYS.all).toEqual(["coupons"]);
		expect(COUPON_QUERY_KEYS.list({ page: 1 })).toEqual(["coupons", "list", { page: 1 }]);
		expect(COUPON_QUERY_KEYS.detail("coupon-1")).toEqual(["coupons", "detail", "coupon-1"]);
		expect(COUPON_QUERY_KEYS.weightRecords("coupon-1")).toEqual(["coupons", "detail", "coupon-1", "weight-records"]);
	});
});
