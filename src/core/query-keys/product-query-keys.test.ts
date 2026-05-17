import { PRODUCT_QUERY_KEYS } from "./product-query-keys";

describe("PRODUCT_QUERY_KEYS", () => {
	it("groups product cache entries under one stable root", () => {
		expect(PRODUCT_QUERY_KEYS.all).toEqual(["products"]);
		expect(PRODUCT_QUERY_KEYS.list()).toEqual(["products", "list"]);
		expect(PRODUCT_QUERY_KEYS.detail("product-1")).toEqual(["products", "detail", "product-1"]);
	});
});
