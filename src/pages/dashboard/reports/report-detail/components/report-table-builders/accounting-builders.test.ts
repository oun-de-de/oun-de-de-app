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
		// `type` (DEBIT/CREDIT) is no longer shown raw — classified from refNo prefix instead
		// (see classifyCashTransactionType); "REC001" matches no known prefix, so it falls back to
		// the debit/credit heuristic.
		const rows = buildCashTransactionReportRows({
			initCashOnHand: 0,
			lines: [{ date: "2026-08-01", refNo: "REC001", type: "DEBIT", name: "Alice", memo: "m", debit: 100, credit: 0 }],
		});

		expect(rows[1]?.cells.type).toBe("Receipt");
		expect(rows[1]?.cells.name).toBe("Alice");
	});

	it("classifies TYPE from the refNo prefix instead of raw DEBIT/CREDIT", () => {
		const rows = buildCashTransactionReportRows({
			initCashOnHand: 0,
			lines: [
				{ date: "2026-08-01", refNo: "IN000019849", type: "CREDIT", name: "Bob", debit: 0, credit: 100 },
				{ date: "2026-08-02", refNo: "INV000000066", type: "DEBIT", name: "Carl", debit: 100, credit: 0 },
				{ date: "2026-08-03", refNo: "EXP-45678901", type: "DEBIT", name: "Dan", debit: 50, credit: 0 },
				{ date: "2026-08-04", refNo: "REV-45678902", type: "CREDIT", name: "Eve", debit: 0, credit: 50 },
				{ date: "2026-08-05", refNo: "LOAN000001", type: "DEBIT", name: "Fay", debit: 20, credit: 0 },
			],
		});

		expect(rows[1]?.cells.type).toBe("Invoice");
		expect(rows[2]?.cells.type).toBe("Receipt");
		expect(rows[3]?.cells.type).toBe("Expense");
		expect(rows[4]?.cells.type).toBe("Revenue");
		expect(rows[5]?.cells.type).toBe("Loan");
	});

	it("filters lines by classified type when typeFilter is set", () => {
		const report = {
			initCashOnHand: 0,
			lines: [
				{ date: "2026-08-01", refNo: "IN000019849", debit: 0, credit: 100 },
				{ date: "2026-08-02", refNo: "EXP-45678901", debit: 50, credit: 0 },
			],
		};

		const filtered = buildCashTransactionReportRows(report, "invoice");
		const refNos = filtered.map((row) => row.cells.refNo);
		expect(refNos).toContain("IN000019849");
		expect(refNos).not.toContain("EXP-45678901");

		const all = buildCashTransactionReportRows(report, "all");
		expect(all.map((row) => row.cells.refNo)).toEqual(expect.arrayContaining(["IN000019849", "EXP-45678901"]));
	});
});
