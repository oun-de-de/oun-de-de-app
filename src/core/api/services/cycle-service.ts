import type { CodeResponse, PagePaginatedResponse } from "@/core/types/common";
import type { ConvertToLoanRequest, CreatePaymentRequest, Cycle, CyclePayment, CycleStatus } from "@/core/types/cycle";
import type { Loan } from "@/core/types/loan";
import type { Pagination } from "@/core/types/pagination";
import { mapPagePaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";
import { type LoanApiResponse, normalizeLoan } from "./loan-service";

export enum CycleApi {
	List = "/cycles",
}

export function normalizeLoanStartDate(value: string): string {
	const normalized = value.trim();
	if (!normalized) return normalized;
	if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
		return new Date(`${normalized}T00:00:00`).toISOString();
	}
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
		return new Date(normalized).toISOString();
	}

	const parsed = new Date(normalized);
	if (Number.isNaN(parsed.getTime())) {
		console.warn(`[normalizeLoanStartDate] Unrecognized date format, passing through raw: "${normalized}"`);
		return normalized;
	}

	return parsed.toISOString();
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
		sort: params.sort ?? "startDate,desc",
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

const getAllCycles = async (params: {
	customerId?: string;
	from?: string;
	to?: string;
	duration?: number;
	status?: CycleStatus;
	sort?: string;
	size?: number;
}): Promise<Cycle[]> => {
	const pageSize = params.size ?? 1000;
	const firstPage = await getCycles({
		...params,
		page: 1,
		size: pageSize,
	});

	if (firstPage.pageCount <= 1) {
		return firstPage.list;
	}

	const remainingCount = firstPage.pageCount - 1;
	const restPages = (
		await Promise.allSettled(
			Array.from({ length: remainingCount }, (_, index) => {
				const page = index + 2;
				return getCycles({ ...params, page, size: pageSize });
			}),
		)
	)
		.filter((s): s is PromiseFulfilledResult<Awaited<ReturnType<typeof getCycles>>> => s.status === "fulfilled")
		.map((s) => s.value);

	return [firstPage, ...restPages].flatMap((page) => page.list);
};

const getPayments = (cycleId: string): Promise<CyclePayment[]> =>
	apiClient.get<CyclePayment[]>({
		url: `${CycleApi.List}/${cycleId}/payments`,
	});

const getCycle = (cycleId: string): Promise<Cycle> =>
	apiClient.get<Cycle>({
		url: `${CycleApi.List}/${cycleId}`,
	});

const createPayment = (cycleId: string, data: CreatePaymentRequest): Promise<CyclePayment> =>
	apiClient.post<CyclePayment>({
		url: `${CycleApi.List}/${cycleId}/payments`,
		data,
	});

const convertToLoan = (cycleId: string, data: ConvertToLoanRequest): Promise<Loan> =>
	apiClient
		.post<LoanApiResponse>({
			url: `${CycleApi.List}/${cycleId}/convert-to-loan`,
			data: {
				...data,
				startDate: normalizeLoanStartDate(data.startDate),
			},
		})
		.then(normalizeLoan);

const generatePaymentCode = (): Promise<CodeResponse> =>
	apiClient.get<CodeResponse>({
		url: `${CycleApi.List}/generate-payment-code`,
	});

export default {
	getCycles,
	getAllCycles,
	getCycle,
	getPayments,
	createPayment,
	convertToLoan,
	generatePaymentCode,
};
