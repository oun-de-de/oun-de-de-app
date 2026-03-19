import type { PagePaginatedResponse } from "@/core/types/common";
import type {
	AccountTypeResult,
	ChartOfAccountListParams,
	ChartOfAccountPagination,
	ChartOfAccountResult,
	CreateAccountTypeRequest,
	CreateChartOfAccountRequest,
	CreateJournalClassRequest,
	CreateJournalTypeRequest,
	JournalClassResult,
	JournalTypeResult,
} from "@/core/types/accounting";
import { mapPagePaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum AccountingApi {
	JournalTypes = "/accounting/journal-types",
	JournalClasses = "/accounting/journal-classes",
	ChartOfAccounts = "/accounting/chart-of-accounts",
	AccountTypes = "/accounting/account-types",
}

const listJournalTypes = (): Promise<JournalTypeResult[]> =>
	apiClient.get<JournalTypeResult[]>({
		url: AccountingApi.JournalTypes,
	});

const createJournalType = (data: CreateJournalTypeRequest): Promise<JournalTypeResult> =>
	apiClient.post<JournalTypeResult>({
		url: AccountingApi.JournalTypes,
		data,
	});

const listJournalClasses = (): Promise<JournalClassResult[]> =>
	apiClient.get<JournalClassResult[]>({
		url: AccountingApi.JournalClasses,
	});

const createJournalClass = (data: CreateJournalClassRequest): Promise<JournalClassResult> =>
	apiClient.post<JournalClassResult>({
		url: AccountingApi.JournalClasses,
		data,
	});

const listChartOfAccounts = (params?: ChartOfAccountListParams): Promise<ChartOfAccountPagination> =>
	apiClient
		.get<PagePaginatedResponse<ChartOfAccountResult>>({
			url: AccountingApi.ChartOfAccounts,
			params: {
				page: params?.page ? params.page - 1 : 0,
				size: params?.limit,
				name: params?.name,
				code: params?.code,
				account_type_id: params?.accountTypeId,
				sort: params?.sort,
			},
		})
		.then(mapPagePaginatedResponseToPagination);

const createChartOfAccount = (data: CreateChartOfAccountRequest): Promise<ChartOfAccountResult> =>
	apiClient.post<ChartOfAccountResult>({
		url: AccountingApi.ChartOfAccounts,
		data,
	});

const listAccountTypes = (): Promise<AccountTypeResult[]> =>
	apiClient.get<AccountTypeResult[]>({
		url: AccountingApi.AccountTypes,
	});

const createAccountType = (data: CreateAccountTypeRequest): Promise<AccountTypeResult> =>
	apiClient.post<AccountTypeResult>({
		url: AccountingApi.AccountTypes,
		data,
	});

export default {
	listJournalTypes,
	createJournalType,
	listJournalClasses,
	createJournalClass,
	listChartOfAccounts,
	createChartOfAccount,
	listAccountTypes,
	createAccountType,
};
