import type { PagePaginatedResponse } from "@/core/types/common";
import type { Pagination } from "@/core/types/pagination";
import type {
	CashTransactionFlattenResult,
	CreateCashTransactionRequest,
	CashTransactionResult,
} from "@/core/types/cash-transaction";
import { mapPagePaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum CashTransactionApi {
	List = "/cash-transactions",
}

type ListCashTransactionsParams = {
	page?: number;
	limit?: number;
	sort?: string;
	paginateFallbackArray?: boolean;
};

const createCashTransaction = (data: CreateCashTransactionRequest): Promise<CashTransactionResult> =>
	apiClient.post<CashTransactionResult>({
		url: CashTransactionApi.List,
		data,
	});

const listCashTransactions = async (
	params?: ListCashTransactionsParams,
): Promise<Pagination<CashTransactionFlattenResult>> => {
	const page = params?.page ?? 1;
	const pageSize = params?.limit ?? 20;
	const response = await apiClient.get<
		PagePaginatedResponse<CashTransactionFlattenResult> | CashTransactionFlattenResult[]
	>({
		url: CashTransactionApi.List,
		params: {
			page: page - 1,
			size: pageSize,
			sort: params?.sort ?? "date,desc",
		},
	});

	if (Array.isArray(response)) {
		const shouldPaginateFallbackArray = params?.paginateFallbackArray ?? true;
		const startIndex = Math.max(0, (page - 1) * pageSize);
		const pagedList = shouldPaginateFallbackArray ? response.slice(startIndex, startIndex + pageSize) : response;

		return {
			list: pagedList,
			page,
			pageSize,
			pageCount: Math.max(1, Math.ceil(response.length / pageSize)),
			total: response.length,
		};
	}

	return mapPagePaginatedResponseToPagination(response);
};

export default {
	listCashTransactions,
	createCashTransaction,
};
