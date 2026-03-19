import { useMutation, useQueryClient } from "@tanstack/react-query";
import accountingService from "@/core/api/services/accounting-service";
import type { CreateChartOfAccountRequest } from "@/core/types/accounting";

export function useCreateChartAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateChartOfAccountRequest) => accountingService.createChartOfAccount(data),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["accounting-chart-accounts"] }),
				queryClient.invalidateQueries({ queryKey: ["accounting-reference-chart-accounts"] }),
			]);
		},
	});
}
