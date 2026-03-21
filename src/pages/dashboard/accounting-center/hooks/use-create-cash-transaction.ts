import { useMutation, useQueryClient } from "@tanstack/react-query";
import cashTransactionService from "@/core/api/services/cash-transaction-service";
import type { CreateCashTransactionRequest } from "@/core/types/cash-transaction";
import { ACCOUNTING_QUERY_KEYS } from "@/pages/dashboard/accounting/constants";

export function useCreateCashTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCashTransactionRequest) => cashTransactionService.createCashTransaction(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ACCOUNTING_QUERY_KEYS.cashTransactions });
		},
	});
}
