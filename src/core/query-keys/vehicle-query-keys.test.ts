import { VEHICLE_QUERY_KEYS } from "./vehicle-query-keys";

describe("VEHICLE_QUERY_KEYS", () => {
	it("groups vehicle cache entries under one stable root", () => {
		expect(VEHICLE_QUERY_KEYS.all).toEqual(["vehicles"]);
		expect(VEHICLE_QUERY_KEYS.list()).toEqual(["vehicles", "list"]);
	});
});
