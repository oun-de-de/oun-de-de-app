import { describe, expect, it } from "vitest";
import type { WeightRecord } from "@/core/types/coupon";
import type { Product } from "@/core/types/product";
import { createLegacyProductValue, normalizeDraftWeightRecords } from "../utils/weight-record-drafts";

const products: Product[] = [
	{
		id: "product-1",
		name: "test packaged prod",
		date: "2026-02-10T00:00:00",
		refNo: "P001",
		unit: {
			id: "unit-1",
			name: "block",
			descr: "",
			type: "unit",
		},
		defaultProductSetting: {
			id: "setting-1",
			price: 100,
			quantity: 10,
		},
	},
];

function createWeightRecord(overrides: Partial<WeightRecord>): WeightRecord {
	return {
		productName: null,
		unit: null,
		pricePerProduct: null,
		quantityPerProduct: null,
		quantity: null,
		weight: null,
		outTime: "2026-02-10T08:16:00",
		memo: null,
		manual: true,
		...overrides,
	};
}

describe("normalizeDraftWeightRecords", () => {
	it("keeps raw record first and sorts product records by cumulative weight", () => {
		const records = [
			createWeightRecord({ productName: "legacy bag", weight: 1218 }),
			createWeightRecord({ productName: null, weight: null }),
			createWeightRecord({ productName: "test packaged prod", weight: 1008 }),
		];

		const result = normalizeDraftWeightRecords(records, products);

		expect(result.map((record) => record.productName)).toEqual([null, "test packaged prod", "legacy bag"]);
	});

	it("keeps unmatched backend product names visible as legacy select values", () => {
		const records = [
			createWeightRecord({ productName: null }),
			createWeightRecord({ productName: "legacy bag", weight: 1218 }),
		];

		const result = normalizeDraftWeightRecords(records, products);

		expect(result[1]).toMatchObject({
			productName: "legacy bag",
			productId: createLegacyProductValue("legacy bag"),
		});
	});
});
