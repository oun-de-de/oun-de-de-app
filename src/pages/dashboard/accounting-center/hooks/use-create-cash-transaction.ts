import { useMutation } from "@tanstack/react-query";
import cashTransactionService from "@/core/api/services/cash-transaction-service";
import type { CreateCashTransactionRequest } from "@/core/types/cash-transaction";

export function useCreateCashTransaction() {
	return useMutation({
		mutationFn: (data: CreateCashTransactionRequest) => cashTransactionService.createCashTransaction(data),
	});
}
