import { useMutation, useQueryClient } from "@tanstack/react-query";
import invoiceService from "@/core/api/services/invoice-service";
import type { InvoiceType } from "@/core/types/invoice";

type UpdateInvoicesPayload = {
	invoiceIds: string[];
	customerName: string;
	type: InvoiceType;
};

export function useUpdateInvoices() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ invoiceIds, customerName, type }: UpdateInvoicesPayload) =>
			invoiceService.updateInvoice(invoiceIds, customerName, type),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}
