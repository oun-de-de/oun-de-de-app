import { buildCashTransactionReportRows } from "./accounting-builders";

describe("accounting builders", () => {
	it("returns no fake sample data when monthlyReportDetails is undefined", () => {
		const rows = buildCashTransactionReportRows(undefined);
		const refNos = rows.map((row) => row.cells.refNo);

		expect(refNos).not.toContain("REC5271");
		expect(refNos).not.toContain("REC5272");
	});

	it("returns no fake sample data when lines is empty", () => {
		const rows = buildCashTransactionReportRows({ lines: [] });
		const refNos = rows.map((row) => row.cells.refNo);

		expect(refNos).not.toContain("REC5271");
	});
});
