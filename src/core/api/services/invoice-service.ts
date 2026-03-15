import type { PagePaginatedResponse } from "@/core/types/common";
import type { Invoice, InvoiceExportLineApi } from "@/core/types/invoice";
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
				customer_id: params?.customerId,
				cycle_id: params?.cycleId,
				from: params?.from,
				to: params?.to,
			},
		})
		.then((res) => mapPagePaginatedResponseToPagination(res));

export const getAllInvoices = async (params?: {
	size?: number;
	sort?: string;
	customerId?: string;
	cycleId?: string;
	from?: string;
	to?: string;
}): Promise<Invoice[]> => {
	const pageSize = params?.size ?? 1000;
	const firstPage = await getInvoices({
		page: 1,
		size: pageSize,
		sort: params?.sort,
		customerId: params?.customerId,
		cycleId: params?.cycleId,
		from: params?.from,
		to: params?.to,
	});

	if (firstPage.pageCount <= 1) {
		return firstPage.list;
	}

	const restPages = await Promise.all(
		Array.from({ length: firstPage.pageCount - 1 }, (_, index) =>
			getInvoices({
				page: index + 2,
				size: pageSize,
				sort: params?.sort,
				customerId: params?.customerId,
				cycleId: params?.cycleId,
				from: params?.from,
				to: params?.to,
			}),
		),
	);

	return [firstPage, ...restPages].flatMap((page) => page.list);
};

export const listInvoiceDetails = (invoiceIds: string[]) =>
	apiClient.post<InvoiceExportLineApi[]>({
		url: `${INVOICE_API.LIST}/export`,
		data: {
			invoiceIds,
		},
	});

export const updateInvoice = (invoiceIds: string[], customerName?: string) =>
	apiClient.put<string>({
		url: `${INVOICE_API.LIST}/update-batch`,
		data: {
			invoiceIds,
			...(customerName !== undefined ? { customerName } : {}),
		},
	});
export default {
	getInvoices,
	getAllInvoices,
	listInvoiceDetails,
	updateInvoice,
};
