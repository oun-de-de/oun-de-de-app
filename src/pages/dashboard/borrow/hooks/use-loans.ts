import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import loanService from "@/core/api/services/loan-service";
import type { BorrowerType, CreateLoanRequest } from "@/core/types/loan";

export const LOAN_QUERY_KEYS = {
	loans: (params?: Record<string, unknown>) => ["loans", params] as const,
	loan: (loanId: string) => ["loan", loanId] as const,
	installments: (loanId: string) => ["loan-installments", loanId] as const,
};

export function useLoans(params?: {
	borrower_type?: BorrowerType;
	borrower_id?: string;
	from?: string;
	to?: string;
	page?: number;
	size?: number;
	sort?: string;
}) {
	return useQuery({
		queryKey: LOAN_QUERY_KEYS.loans(params),
		queryFn: () => loanService.getLoans(params),
	});
}

export function useLoanDetails(loanId?: string) {
	return useQuery({
		queryKey: LOAN_QUERY_KEYS.loan(loanId ?? ""),
		queryFn: () => loanService.getLoanDetails(loanId ?? ""),
		enabled: !!loanId,
	});
}

export function useInstallments(loanId?: string) {
	return useQuery({
		queryKey: LOAN_QUERY_KEYS.installments(loanId ?? ""),
		queryFn: () => loanService.getInstallments(loanId ?? ""),
		enabled: !!loanId,
	});
}

export function useCreateLoan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateLoanRequest) => loanService.createLoan(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function usePayInstallment(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (installmentId: string) => loanService.payInstallment(loanId ?? "", installmentId),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.installments(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}
