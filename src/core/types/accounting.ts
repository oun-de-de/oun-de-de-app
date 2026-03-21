import type { Pagination } from "./pagination";

export type JournalTypeResult = {
	id: string;
	name: string;
	descr?: string;
};

export type CreateJournalTypeRequest = {
	name: string;
	descr?: string;
};

export type JournalClassResult = {
	id: string;
	name: string;
	descr?: string;
};

export type CreateJournalClassRequest = {
	name: string;
	descr?: string;
};

export type AccountTypeNature = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export type AccountTypeResult = {
	id: string;
	name: string;
	descr?: string;
	code: string;
	nature: AccountTypeNature;
};

export type CreateAccountTypeRequest = {
	name: string;
	descr?: string;
	code: string;
	nature: AccountTypeNature;
};

export type ChartOfAccountResult = {
	id: string;
	name: string;
	descr?: string;
	code: string;
	accountTypeId?: string;
	accountType?: AccountTypeResult;
};

export type CreateChartOfAccountRequest = {
	name: string;
	descr?: string;
	accountTypeId: string;
	code: string;
};

export type ChartOfAccountListParams = {
	page?: number;
	limit?: number;
	name?: string;
	code?: string;
	accountTypeId?: string;
	loadAccountType?: boolean;
	sort?: string;
};

export type ChartOfAccountPagination = Pagination<ChartOfAccountResult>;
