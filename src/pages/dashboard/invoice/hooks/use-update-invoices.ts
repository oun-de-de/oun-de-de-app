import { useMutation, useQueryClient } from "@tanstack/react-query";
import invoiceService from "@/core/api/services/invoice-service";

export type UpdateInvoicesPayload = {
	invoiceIds: string[];
	customerName?: string;
};

export function useUpdateInvoices() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ invoiceIds, customerName }: UpdateInvoicesPayload) =>
			invoiceService.updateInvoice(invoiceIds, customerName),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}
