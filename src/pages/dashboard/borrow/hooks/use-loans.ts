import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import loanService from "@/core/api/services/loan-service";
import type {
	BorrowerType,
	CreateLoanPaymentRequest,
	CreateLoanRequest,
	ExtendLoanRequest,
	UpdateLoanRequest,
} from "@/core/types/loan";

export const LOAN_QUERY_KEYS = {
	loans: (params?: Record<string, unknown>) => ["loans", params] as const,
	loan: (loanId: string) => ["loan", loanId] as const,
	payments: (loanId: string) => ["loan-payments", loanId] as const,
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

export function useCreateLoan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateLoanRequest) => loanService.createLoan(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function useLoanPayments(loanId?: string) {
	return useQuery({
		queryKey: LOAN_QUERY_KEYS.payments(loanId ?? ""),
		queryFn: () => loanService.listLoanPayments(loanId ?? ""),
		enabled: !!loanId,
	});
}

export function useCreateLoanPayment(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateLoanPaymentRequest) => loanService.createPayment(loanId ?? "", data),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.payments(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function usePostponeLoan(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => loanService.postponeLoan(loanId ?? ""),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.payments(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function useExtendLoan(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ExtendLoanRequest) => loanService.extendLoan(loanId ?? "", data),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.payments(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function useUpdateLoan(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateLoanRequest) => loanService.updateLoan(loanId ?? "", data),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.payments(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}
