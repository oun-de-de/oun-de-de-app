import { buildCashTransactionReportRows } from "./accounting-builders";

describe("accounting builders", () => {
	it("returns no fake sample data when the report is undefined", () => {
		const rows = buildCashTransactionReportRows(undefined);
		const refNos = rows.map((row) => row.cells.refNo);

		expect(refNos).not.toContain("REC5271");
		expect(refNos).not.toContain("REC5272");
	});

	it("returns no fake sample data when lines is empty", () => {
		const rows = buildCashTransactionReportRows({ lines: [] });

		expect(rows.map((row) => row.cells.refNo)).not.toContain("REC5271");
	});

	it("starts the running balance at initCashOnHand, not a hardcoded constant", () => {
		const rows = buildCashTransactionReportRows({
			initCashOnHand: 1000,
			lines: [
				{ date: "2026-08-01", refNo: "REC001", debit: 5000, credit: 0 },
				{ date: "2026-08-02", refNo: "EXP001", debit: 0, credit: 2000 },
			],
		});

		const balances = rows.map((row) => row.cells.balance);
		expect(balances[0]).toBe("1,000"); // account header row = opening balance
		expect(balances[1]).toBe("6,000");
		expect(balances[2]).toBe("4,000");
	});

	it("falls back to a zero opening balance when the API omits initCashOnHand", () => {
		const rows = buildCashTransactionReportRows({
			lines: [{ date: "2026-08-01", refNo: "REC001", debit: 5000, credit: 0 }],
		});

		expect(rows[0]?.cells.balance).toBe("0");
		expect(rows[1]?.cells.balance).toBe("5,000");
	});

	it("reads the cash-transaction line shape, not the monthly-report-details one", () => {
		// CashTransactionReportLine carries `type` and `name`; MonthlyReportLine used `reason`
		// and `customerName`. Reading the wrong shape silently blanks those columns.
		const rows = buildCashTransactionReportRows({
			initCashOnHand: 0,
			lines: [{ date: "2026-08-01", refNo: "REC001", type: "DEBIT", name: "Alice", memo: "m", debit: 100, credit: 0 }],
		});

		expect(rows[1]?.cells.type).toBe("DEBIT");
		expect(rows[1]?.cells.name).toBe("Alice");
	});
});
