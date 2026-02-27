import type { PaginatedResponse } from "@/core/types/common";
import type { BorrowerType, CreateLoanRequest, Installment, InstallmentStatus, Loan } from "@/core/types/loan";
import { apiClient } from "../apiClient";

export enum LoanApi {
	Loans = "/loans",
}

type LoanApiResponse = Omit<Loan, "createdAt" | "borrowerType"> & {
	borrowerType: string;
	createdAt?: string;
	createAt?: string;
};

type InstallmentApiResponse = Omit<Installment, "status"> & {
	status: string;
};

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

function normalizeLoan(data: LoanApiResponse): Loan {
	return {
		...data,
		borrowerType: normalizeBorrowerType(data.borrowerType),
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
			data,
		})
		.then(normalizeLoan);

const getLoanDetails = (loanId: string): Promise<Loan> =>
	apiClient
		.get<LoanApiResponse>({
			url: `${LoanApi.Loans}/${loanId}`,
		})
		.then(normalizeLoan);

const getInstallments = (loanId: string): Promise<Installment[]> =>
	apiClient
		.get<InstallmentApiResponse[]>({
			url: `${LoanApi.Loans}/${loanId}/installments`,
		})
		.then((response) => response.map(normalizeInstallment));

const payInstallment = (loanId: string, installmentId: string): Promise<Installment> =>
	apiClient
		.post<InstallmentApiResponse>({
			url: `${LoanApi.Loans}/${loanId}/installments/${installmentId}/pay`,
		})
		.then(normalizeInstallment);

export default {
	getLoans,
	createLoan,
	getLoanDetails,
	getInstallments,
	payInstallment,
};
