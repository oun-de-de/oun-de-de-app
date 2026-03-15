import type { PaginatedResponse } from "@/core/types/common";
import type {
	BorrowerType,
	CreateLoanPaymentRequest,
	CreateLoanRequest,
	ExtendLoanRequest,
	Installment,
	InstallmentStatus,
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

type InstallmentApiResponse = Omit<Installment, "status"> & {
	status: string;
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

function normalizeInstallmentStatus(value: string): InstallmentStatus {
	const normalizedValue = value.toLowerCase();
	if (normalizedValue === "paid") return "paid";
	if (normalizedValue === "overdue") return "overdue";
	return "unpaid";
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

function normalizeInstallment(data: InstallmentApiResponse): Installment {
	return {
		...data,
		status: normalizeInstallmentStatus(data.status),
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
		.get<PaginatedResponse<LoanApiResponse>>({
			url: LoanApi.Loans,
			params: {
				...params,
				borrower_type: toApiBorrowerType(params?.borrower_type),
				sort: params?.sort ?? "createAt,desc",
			},
		})
		.then((response) => ({
			...response,
			content: response.content.map(normalizeLoan),
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

const getInstallments = (loanId: string): Promise<Installment[]> =>
	apiClient
		.get<InstallmentApiResponse[]>({
			url: `${LoanApi.Loans}/${loanId}/installments`,
		})
		.then((response) => response.map(normalizeInstallment));

const createPayment = (loanId: string, data: CreateLoanPaymentRequest): Promise<LoanPayment> =>
	apiClient.post<LoanPayment>({
		url: `${LoanApi.Loans}/${loanId}/pay`,
		data,
	});

const payInstallment = (loanId: string, installmentId: string): Promise<Installment> =>
	apiClient
		.post<InstallmentApiResponse>({
			url: `${LoanApi.Loans}/${loanId}/installments/${installmentId}/pay`,
		})
		.then(normalizeInstallment);

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
	getInstallments,
	createPayment,
	payInstallment,
	postponeLoan,
	extendLoan,
	updateLoan,
};
