import { CUSTOMER_QUERY_KEYS } from "./customer-query-keys";

describe("CUSTOMER_QUERY_KEYS", () => {
	it("groups customer cache entries under one stable root", () => {
		expect(CUSTOMER_QUERY_KEYS.all).toEqual(["customers"]);
		expect(CUSTOMER_QUERY_KEYS.list({ page: 1 })).toEqual(["customers", "list", { page: 1 }]);
		expect(CUSTOMER_QUERY_KEYS.detail("customer-1")).toEqual(["customers", "detail", "customer-1"]);
		expect(CUSTOMER_QUERY_KEYS.vehicles("customer-1")).toEqual(["customers", "detail", "customer-1", "vehicles"]);
		expect(CUSTOMER_QUERY_KEYS.productSettings("customer-1")).toEqual([
			"customers",
			"detail",
			"customer-1",
			"product-settings",
		]);
	});
});
