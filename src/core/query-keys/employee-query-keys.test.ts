import { EMPLOYEE_QUERY_KEYS } from "./employee-query-keys";

describe("EMPLOYEE_QUERY_KEYS", () => {
	it("groups employee cache entries under one stable root", () => {
		expect(EMPLOYEE_QUERY_KEYS.all).toEqual(["employees"]);
		expect(EMPLOYEE_QUERY_KEYS.list()).toEqual(["employees", "list"]);
	});
});
