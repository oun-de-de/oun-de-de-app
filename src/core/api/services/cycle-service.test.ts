import { describe, expect, it } from "vitest";
import { normalizeLoanStartDate } from "./cycle-service";

describe("normalizeLoanStartDate", () => {
	it("converts local date-time values to ISO UTC format", () => {
		expect(normalizeLoanStartDate("2026-04-14T00:00:00")).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		);
	});

	it("converts date-only values to ISO UTC format", () => {
		expect(normalizeLoanStartDate("2026-04-14")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
	});

	it("preserves ISO timestamps with milliseconds and timezone suffix", () => {
		expect(normalizeLoanStartDate("2026-04-14T13:17:44.067Z")).toBe("2026-04-14T13:17:44.067Z");
	});
});
