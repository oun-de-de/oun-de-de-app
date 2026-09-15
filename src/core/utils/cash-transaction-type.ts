// BE gap: cash-transaction data only carries DEBIT/CREDIT, no real document category (see BE TODO on
// CashTransactionReportLine in core/types/report.ts). refNo prefix encodes the real type instead —
// confirmed against live data and FE-generated codes (2026-09-15): "IN" = invoice (e.g. IN000019849),
// "INV" = receipt/payment code (e.g. INV000000066), "EXP-"/"REV-" = accounting/create-expense &
// create-revenue pages (accounting-form-utils.ts generateRefNo), "LOAN" = loan.
// Order matters: check "INV" before "IN" since "INV" starts with "IN".
const TYPE_PREFIXES: ReadonlyArray<readonly [string, string]> = [
	["INV", "Receipt"],
	["IN", "Invoice"],
	["EXP", "Expense"],
	["REV", "Revenue"],
	["LOAN", "Loan"],
];

export function classifyCashTransactionType(refNo: string | null | undefined, isDebit: boolean): string {
	const normalized = (refNo ?? "").trim().toUpperCase();
	for (const [prefix, label] of TYPE_PREFIXES) {
		if (normalized.startsWith(prefix)) return label;
	}
	// Unrecognized refNo (e.g. "CT<timestamp>" manual entries) — best-effort guess from debit/credit,
	// matching prior behavior.
	return isDebit ? "Receipt" : "Expense";
}
