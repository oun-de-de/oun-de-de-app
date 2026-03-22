import type { PagePaginatedResponse, PaginatedResponse } from "@/core/types/common";
import type {
	BorrowerType,
	CreateLoanPaymentRequest,
	CreateLoanRequest,
	ExtendLoanRequest,
	Loan,
	LoanPayment,
	LoanStatus,
	UpdateLoanRequest,
} from "@/core/types/loan";
import { apiClient } from "../apiClient";

export enum LoanApi {
	Loans = "/loans",
}

type LoanApiResponse = Omit<Loan, "borrowerType" | "createdAt" | "status"> & {
	borrowerType: string;
	status: string;
	createdAt?: string;
	createAt?: string;
};

function toApiBorrowerType(value?: BorrowerType): string | undefined {
	if (!value) return undefined;
	return value.toUpperCase();
}

function normalizeBorrowerType(value: string): BorrowerType {
	const normalizedValue = value.toLowerCase();
	if (normalizedValue === "employee" || normalizedValue === "customer") {
		return normalizedValue;
	}
	console.warn(`Unknown borrowerType received from API: ${value}. Fallback to customer.`);
	return "customer";
}

function normalizeLoanStatus(value: string): LoanStatus {
	const normalizedValue = value.toLowerCase();
	if (normalizedValue === "due") return "due";
	if (normalizedValue === "complete") return "complete";
	return "normal";
}

function normalizeLoan(data: LoanApiResponse): Loan {
	return {
		...data,
		borrowerType: normalizeBorrowerType(data.borrowerType),
		status: normalizeLoanStatus(data.status),
		monthlyPayment: data.installmentAmount,
		termMonths: data.termMonths ?? 0,
		createdAt: data.createdAt ?? data.createAt ?? "",
	};
}

const getLoans = (params?: {
	borrower_type?: BorrowerType;
	borrower_id?: string;
	from?: string;
	to?: string;
	page?: number;
	size?: number;
	sort?: string;
}): Promise<PaginatedResponse<Loan>> =>
	apiClient
		.get<PagePaginatedResponse<LoanApiResponse>>({
			url: LoanApi.Loans,
			params: {
				...params,
				borrower_type: toApiBorrowerType(params?.borrower_type),
				sort: params?.sort ?? "createAt,desc",
			},
		})
		.then((response) => ({
			content: response.content.map(normalizeLoan),
			pageable: {
				pageNumber: response.page.number,
				pageSize: response.page.size,
				sort: {
					empty: false,
					sorted: true,
					unsorted: false,
				},
				offset: response.page.number * response.page.size,
				paged: true,
				unpaged: false,
			},
			totalElements: response.page.totalElements,
			totalPages: response.page.totalPages,
			last: response.page.number + 1 >= response.page.totalPages,
			size: response.page.size,
			number: response.page.number,
			sort: {
				empty: false,
				sorted: true,
				unsorted: false,
			},
			numberOfElements: response.content.length,
			first: response.page.number === 0,
			empty: response.content.length === 0,
		}));

const createLoan = (data: CreateLoanRequest): Promise<Loan> =>
	apiClient
		.post<LoanApiResponse>({
			url: LoanApi.Loans,
			data: {
				...data,
				borrowerType: toApiBorrowerType(data.borrowerType),
			},
		})
		.then(normalizeLoan);

const getLoanDetails = (loanId: string): Promise<Loan> =>
	apiClient
		.get<LoanApiResponse>({
			url: `${LoanApi.Loans}/${loanId}`,
		})
		.then(normalizeLoan);

const listLoanPayments = (loanId: string): Promise<LoanPayment[]> =>
	apiClient.get<LoanPayment[]>({
		url: `${LoanApi.Loans}/${loanId}/payments`,
	});

const createPayment = (loanId: string, data: CreateLoanPaymentRequest): Promise<LoanPayment> =>
	apiClient.post<LoanPayment>({
		url: `${LoanApi.Loans}/${loanId}/payments`,
		data,
	});

const postponeLoan = (loanId: string): Promise<Loan> =>
	apiClient
		.post<LoanApiResponse>({
			url: `${LoanApi.Loans}/${loanId}/postpone`,
		})
		.then(normalizeLoan);

const extendLoan = (loanId: string, data: ExtendLoanRequest): Promise<Loan> =>
	apiClient
		.post<LoanApiResponse>({
			url: `${LoanApi.Loans}/${loanId}/extend-loan`,
			data,
		})
		.then(normalizeLoan);

const updateLoan = (loanId: string, data: UpdateLoanRequest): Promise<Loan> =>
	apiClient
		.put<LoanApiResponse>({
			url: `${LoanApi.Loans}/${loanId}`,
			data,
		})
		.then(normalizeLoan);

export default {
	getLoans,
	createLoan,
	getLoanDetails,
	listLoanPayments,
	createPayment,
	postponeLoan,
	extendLoan,
	updateLoan,
};
