import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import cycleService from "@/core/api/services/cycle-service";
import type { ConvertToLoanRequest, CreatePaymentRequest, Cycle, CyclePayment } from "@/core/types/cycle";
import type { Pagination } from "@/core/types/pagination";

export function useCyclePayments(cycleId?: string) {
	const queryClient = useQueryClient();

	const paymentQueryKey = ["cycle-payments", cycleId] as const;
	const cycleDetailQueryKey = ["cycle-detail", cycleId] as const;
	const createInvalidateKeys = [
		paymentQueryKey,
		cycleDetailQueryKey,
		["cycles"],
		["invoices"],
		["report", "payment-list"],
		["report", "invoice-list"],
		["report", "open-invoice-report"],
		["report", "invoice-export"],
	] as const;
	const convertInvalidateKeys = [
		["cycles"],
		["invoices"],
		["loans"],
		["report", "payment-list"],
		["report", "invoice-list"],
		["report", "open-invoice-report"],
		["report", "invoice-export"],
	] as const;

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
		onSuccess: async (createdPayment) => {
			queryClient.setQueryData<CyclePayment[]>(paymentQueryKey, (previousPayments = []) => [
				createdPayment,
				...previousPayments,
			]);

			queryClient.setQueryData<Cycle | undefined>(cycleDetailQueryKey, (previousCycle) =>
				previousCycle
					? {
							...previousCycle,
							totalPaidAmount: (previousCycle.totalPaidAmount ?? 0) + (createdPayment.amount ?? 0),
						}
					: previousCycle,
			);

			queryClient.setQueriesData<Pagination<Cycle>>({ queryKey: ["cycles"] }, (previousPagination) => {
				if (!previousPagination) return previousPagination;

				return {
					...previousPagination,
					list: previousPagination.list.map((cycle) =>
						cycle.id === createdPayment.cycleId
							? {
									...cycle,
									totalPaidAmount: (cycle.totalPaidAmount ?? 0) + (createdPayment.amount ?? 0),
								}
							: cycle,
					),
				};
			});

			await Promise.allSettled(createInvalidateKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
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
