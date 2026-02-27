import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import loanService from "@/core/api/services/loan-service";
import type { Installment, Loan } from "@/core/types/loan";

export function useBorrowDetail(loanId: string) {
	const queryClient = useQueryClient();

	const loanQuery = useQuery<Loan>({
		queryKey: ["loan-details", loanId],
		queryFn: () => loanService.getLoanDetails(loanId),
		enabled: !!loanId,
	});

	const installmentsQuery = useQuery<Installment[]>({
		queryKey: ["loan-installments", loanId],
		queryFn: () => loanService.getInstallments(loanId),
		enabled: !!loanId,
	});

	const { mutateAsync: payInstallment, isPending: isPaying } = useMutation({
		mutationFn: (installmentId: string) => loanService.payInstallment(loanId, installmentId),
		onSuccess: () => {
			toast.success("Installment paid successfully");
			queryClient.invalidateQueries({ queryKey: ["loan-installments", loanId] });
			queryClient.invalidateQueries({ queryKey: ["loan-details", loanId] });
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
		onError: (error) => {
			toast.error("Failed to pay installment");
			console.error("Installment payment error:", error);
		},
	});

	return {
		loan: loanQuery.data,
		isLoading: loanQuery.isLoading || installmentsQuery.isLoading,
		isError: loanQuery.isError || installmentsQuery.isError,
		installments: installmentsQuery.data || [],
		payInstallment,
		isPaying,
	};
}
