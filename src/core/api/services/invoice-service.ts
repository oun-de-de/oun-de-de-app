import type { PagePaginatedResponse } from "@/core/types/common";
import type { Invoice, InvoiceExportLineResult, InvoiceType } from "@/core/types/invoice";
import type { Pagination } from "@/core/types/pagination";
import { mapPagePaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum INVOICE_API {
	LIST = "/invoices",
}

export const getInvoices = (params?: {
	page?: number;
	size?: number;
	sort?: string;
	type?: InvoiceType;
	refNo?: string;
	customerName?: string;
	customerId?: string;
	cycleId?: string;
	from?: string;
	to?: string;
}): Promise<Pagination<Invoice>> =>
	apiClient
		.get<PagePaginatedResponse<Invoice>>({
			url: INVOICE_API.LIST,
			params: {
				page: params?.page ? params.page - 1 : 0,
				size: params?.size,
				sort: params?.sort ?? "date,desc",
				type: params?.type,
				refNo: params?.refNo,
				customerName: params?.customerName,
				customer_id: params?.customerId,
				cycle_id: params?.cycleId,
				from: params?.from,
				to: params?.to,
			},
		})
		.then(mapPagePaginatedResponseToPagination);

export const exportInvoice = (invoiceIds: string[]) =>
	apiClient.post<InvoiceExportLineResult[]>({
		url: `${INVOICE_API.LIST}/export`,
		data: {
			invoiceIds,
		},
	});

export const updateInvoice = (invoiceIds: string[], customerName: string, type: InvoiceType) =>
	apiClient.put<string>({
		url: `${INVOICE_API.LIST}/update-batch`,
		data: {
			invoiceIds,
			customerName,
			type,
		},
	});
export default {
	getInvoices,
	exportInvoice,
	updateInvoice,
};
