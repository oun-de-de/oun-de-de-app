import type { PagePaginatedResponse } from "@/core/types/common";
import type { ConvertToLoanRequest, CreatePaymentRequest, Cycle, CyclePayment, CycleStatus } from "@/core/types/cycle";
import type { Loan } from "@/core/types/loan";
import type { Pagination } from "@/core/types/pagination";
import { mapPagePaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum CycleApi {
	List = "/cycles",
}

const getCycles = (params: {
	customerId?: string;
	from?: string;
	to?: string;
	duration?: number;
	status?: CycleStatus;
	page?: number;
	size?: number;
	sort?: string;
}): Promise<Pagination<Cycle>> => {
	const queryParams = {
		page: params.page ? params.page - 1 : 0,
		size: params.size,
		sort: params.sort,
		status: params.status,
		...(params.customerId ? { customer_id: params.customerId } : {}),
		...(params.from ? { from: params.from } : {}),
		...(params.to ? { to: params.to } : {}),
		...(typeof params.duration === "number" ? { duration: params.duration } : {}),
	};

	return apiClient
		.get<PagePaginatedResponse<Cycle>>({
			url: CycleApi.List,
			params: queryParams,
		})
		.then(mapPagePaginatedResponseToPagination);
};

const getPayments = (cycleId: string): Promise<CyclePayment[]> =>
	apiClient.get<CyclePayment[]>({
		url: `${CycleApi.List}/${cycleId}/payments`,
	});

const createPayment = (cycleId: string, data: CreatePaymentRequest): Promise<CyclePayment> =>
	apiClient.post<CyclePayment>({
		url: `${CycleApi.List}/${cycleId}/payments`,
		data,
	});

const convertToLoan = (cycleId: string, data: ConvertToLoanRequest): Promise<Loan> =>
	apiClient.post<Loan>({
		url: `${CycleApi.List}/${cycleId}/convert-to-loan`,
		data,
	});

export default {
	getCycles,
	getPayments,
	createPayment,
	convertToLoan,
};
