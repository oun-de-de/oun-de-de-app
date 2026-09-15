import type { SelectOption } from "./common";

export type CashTransactionType = "DEBIT" | "CREDIT";

// BE TODO (found 2026-09-15 ref-no link sweep): `id` here is the cash-transaction/ledger-entry id,
// not an invoice id — and `type` is only DEBIT/CREDIT, so there is no way to tell whether a given
// row even originated from an invoice. Linking refNo to /dashboard/invoice/export-preview?ids=<id>
// would be wrong (id namespace mismatch, or the row isn't an invoice at all). Needs a real
// `invoiceId`/document-type field before refNo can link out. Same root gap as CashTransactionReportLine
// and MonthlyReportLine in src/core/types/report.ts.
export type CashTransactionFlattenResult = {
	id: string;
	refNo: string;
	type: CashTransactionType;
	reason?: string;
	date?: string;
	currency?: string;
	memo?: string;
	amount: number;
};

export type CashTransaction = {
	id: string;
	no: number;
	date: string;
	refNo: string;
	type: string;
	counterpartyId: string;
	counterpartyName: string;
	memo: string;
	debit: number;
	credit: number;
	balance: number;
};

export type CashTransactionCounterparty = {
	id: string;
	name: string;
	code: string;
};

export type CashTransactionSummary = {
	count: number;
	debit: number;
	credit: number;
	balance: number;
};

export type CashTransactionDataset = {
	accountLabel: string;
	rows: CashTransaction[];
	counterparties: CashTransactionCounterparty[];
	typeOptions: SelectOption[];
	summary: CashTransactionSummary;
};

export type CreateCashTransactionDetailRequest = {
	chartOfAccountId: string;
	accountTypeId: string;
	memo?: string;
	amount: number;
	customerId: string;
	journalClassId?: string;
};

export type CreateCashTransactionRequest = {
	refNo: string;
	type: CashTransactionType | Lowercase<CashTransactionType>;
	date?: string;
	currencyId?: string;
	employeeId: string;
	memo?: string;
	cashTransactionDetails: CreateCashTransactionDetailRequest[];
};

export type CashTransactionDetailResult = {
	id: string;
	chartOfAccountId: string;
	accountTypeId: string;
	memo?: string;
	amount: number;
	customerId: string;
	journalClassId?: string;
};

export type CashTransactionResult = {
	id: string;
	refNo: string;
	type: CashTransactionType;
	date?: string;
	currency?: string;
	employeeId: string;
	memo?: string;
	cashTransactionDetails: CashTransactionDetailResult[];
};
