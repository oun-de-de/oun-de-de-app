import { cashTransactionFormSchema, generateCashTransactionDateTime, generateRefNo, getChartAccountLabel } from "./accounting-form-utils";

describe("accounting form utils", () => {
	it("generates prefixed reference numbers for expense vouchers", () => {
		vi.spyOn(Date, "now").mockReturnValue(1712345678901);

		expect(generateRefNo("EXP")).toBe("EXP-45678901");
		expect(generateRefNo("REV")).toBe("REV-45678901");
	});

	it("formats chart account labels only when code and name exist", () => {
		expect(getChartAccountLabel("1010", "Cash")).toBe("1010 : Cash");
		expect(getChartAccountLabel("1010", undefined)).toBe("");
		expect(getChartAccountLabel(undefined, "Cash")).toBe("");
	});

	it("creates a local datetime input value", () => {
		const value = generateCashTransactionDateTime();
		expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
	});

	it("rejects expense lines without customer or positive amount", () => {
		const result = cashTransactionFormSchema.safeParse({
			refNo: "EXP-0001",
			date: "2025-04-22T08:30",
			currencyId: "currency-1",
			employeeId: "employee-1",
			memo: "",
			details: [
				{
					id: "line-1",
					accountCode: "ACC-01",
					memo: "",
					amount: 0,
					customerId: "",
					className: "",
				},
			],
		});

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.error.flatten().fieldErrors.details).toBeDefined();
		expect(result.error.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ message: "Amount must be greater than 0" }),
				expect.objectContaining({ message: "Customer name is required" }),
			]),
		);
	});
});
