import { SETTINGS_QUERY_KEYS } from "./settings-query-keys";

describe("SETTINGS_QUERY_KEYS", () => {
	it("groups setting cache entries by setting type", () => {
		expect(SETTINGS_QUERY_KEYS.all).toEqual(["settings"]);
		expect(SETTINGS_QUERY_KEYS.warehouses.list()).toEqual(["settings", "warehouses", "list"]);
		expect(SETTINGS_QUERY_KEYS.units.list()).toEqual(["settings", "units", "list"]);
		expect(SETTINGS_QUERY_KEYS.currencies.list()).toEqual(["settings", "currencies", "list"]);
		expect(SETTINGS_QUERY_KEYS.suppliers.list()).toEqual(["settings", "suppliers", "list"]);
	});
});
