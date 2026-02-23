import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import cycleService from "@/core/api/services/cycle-service";
import type { ConvertToLoanRequest, CreatePaymentRequest } from "@/core/types/cycle";

export function useCyclePayments(cycleId?: string) {
	const queryClient = useQueryClient();

	const paymentsQuery = useQuery({
		queryKey: ["cycle-payments", cycleId],
		queryFn: () => cycleService.getPayments(cycleId ?? ""),
		enabled: !!cycleId,
	});

	const createPaymentMutation = useMutation({
		mutationFn: (payload: CreatePaymentRequest) => {
			if (!cycleId) throw new Error("Cycle ID is required");
			return cycleService.createPayment(cycleId, payload);
		},
		onSuccess: () => {
			toast.success("Payment created successfully");
			queryClient.invalidateQueries({ queryKey: ["cycle-payments", cycleId] });
			queryClient.invalidateQueries({ queryKey: ["cycles"] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
		onError: () => {
			toast.error("Failed to create payment");
		},
	});

	const convertToLoanMutation = useMutation({
		mutationFn: (payload: ConvertToLoanRequest) => {
			if (!cycleId) throw new Error("Cycle ID is required");
			return cycleService.convertToLoan(cycleId, payload);
		},
		onSuccess: () => {
			toast.success("Loan created successfully");
			queryClient.invalidateQueries({ queryKey: ["cycles"] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
		onError: () => {
			toast.error("Failed to convert cycle to loan");
		},
	});

	return {
		payments: paymentsQuery.data ?? [],
		isLoadingPayments: paymentsQuery.isLoading,
		refetchPayments: paymentsQuery.refetch,
		createPayment: createPaymentMutation.mutateAsync,
		isCreatingPayment: createPaymentMutation.isPending,
		convertToLoan: convertToLoanMutation.mutateAsync,
		isConvertingToLoan: convertToLoanMutation.isPending,
	};
}
