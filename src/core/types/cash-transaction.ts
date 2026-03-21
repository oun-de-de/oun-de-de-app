import type { SelectOption } from "./common";

export type CashTransactionType = "DEBIT" | "CREDIT";

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
	type: CashTransactionType;
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
