import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import cycleService from "@/core/api/services/cycle-service";
import type { ConvertToLoanRequest, CreatePaymentRequest } from "@/core/types/cycle";

export function useCyclePayments(cycleId?: string) {
	const queryClient = useQueryClient();

	const paymentQueryKey = ["cycle-payments", cycleId] as const;
	const createInvalidateKeys = [paymentQueryKey, ["cycles"], ["invoices"]] as const;
	const convertInvalidateKeys = [["cycles"], ["invoices"], ["loans"]] as const;

	// invalidate many queries
	const invalidateMany = async (queryKeys: ReadonlyArray<readonly unknown[]>) => {
		await Promise.all(queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
	};

	// ensure cycleId is exists
	const requireCycleId = () => {
		if (!cycleId) throw new Error("Cycle ID is required");
		return cycleId;
	};

	const paymentsQuery = useQuery({
		queryKey: paymentQueryKey,
		queryFn: () => cycleService.getPayments(requireCycleId()),
		enabled: !!cycleId,
	});

	const createPaymentMutation = useMutation({
		mutationFn: (payload: CreatePaymentRequest) => cycleService.createPayment(requireCycleId(), payload),
		onSuccess: async () => {
			toast.success("Payment created successfully");
			await invalidateMany(createInvalidateKeys);
		},
		onError: () => {
			toast.error("Failed to create payment");
		},
	});

	const convertToLoanMutation = useMutation({
		mutationFn: (payload: ConvertToLoanRequest) => cycleService.convertToLoan(requireCycleId(), payload),
		onSuccess: async () => {
			toast.success("Loan created successfully");
			await invalidateMany(convertInvalidateKeys);
		},
		onError: () => {
			toast.error("Failed to convert cycle to loan");
		},
	});

	return {
		payments: paymentsQuery.data ?? [],
		isLoadingPayments: paymentsQuery.isLoading,
		createPayment: createPaymentMutation.mutateAsync,
		isCreatingPayment: createPaymentMutation.isPending,
		convertToLoan: convertToLoanMutation.mutateAsync,
		isConvertingToLoan: convertToLoanMutation.isPending,
	};
}
