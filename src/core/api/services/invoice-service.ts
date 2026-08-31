import { toast } from "sonner";
import type { PagePaginatedResponse } from "@/core/types/common";
import type { Invoice, InvoiceExportLineApi, PaymentResult } from "@/core/types/invoice";
import type { Pagination } from "@/core/types/pagination";
import { mapPagePaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum INVOICE_API {
	LIST = "/invoices",
	PAYMENTS = "/payments",
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

	const settled = await Promise.allSettled(
		Array.from({ length: firstPage.pageCount - 1 }, (_, index) => {
			const page = index + 2;
			return getInvoices({
				page,
				size: pageSize,
				sort: params?.sort,
				customerId: params?.customerId,
				cycleId: params?.cycleId,
				from: params?.from,
				to: params?.to,
			});
		}),
	);

	const rejected = settled.filter((result) => result.status === "rejected");
	if (rejected.length > 0) {
		toast.error(`Failed to fetch ${rejected.length} invoice page(s)`, {
			description: "Returning partial invoice data.",
		});
	}

	const restPages = settled
		.filter(
			(result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof getInvoices>>> =>
				result.status === "fulfilled",
		)
		.map((result) => result.value);

	// Flatten first page + remaining pages into Invoice[].
	// Page-based API → transparent flat list for callers.
	return [firstPage, ...restPages].flatMap((page) => page.list);
};

export const listInvoiceDetails = (
	invoiceIds: string[],
	params?: {
		productName?: string;
		referredBy?: string;
	},
) =>
	apiClient.post<InvoiceExportLineApi[]>({
		url: `${INVOICE_API.LIST}/export`,
		data: {
			invoiceIds,
			...(params?.productName ? { productName: params.productName } : {}),
			...(params?.referredBy ? { referredBy: params.referredBy } : {}),
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
export const getPayments = (params?: {
	page?: number;
	size?: number;
	sort?: string;
	customerId?: string;
	from?: string;
	to?: string;
}): Promise<Pagination<PaymentResult>> =>
	apiClient
		.get<PagePaginatedResponse<PaymentResult> | PaymentResult[]>({
			url: INVOICE_API.PAYMENTS,
			params: {
				page: params?.page ? params.page - 1 : 0,
				size: params?.size,
				sort: params?.sort ?? "paymentDate,desc",
				customer_id: params?.customerId,
				from: params?.from,
				to: params?.to,
			},
		})
		.then((res) => {
			if (Array.isArray(res)) {
				return {
					list: res,
					page: 1,
					pageSize: res.length,
					pageCount: 1,
					total: res.length,
				};
			}
			return mapPagePaginatedResponseToPagination(res);
		});

export default {
	getInvoices,
	getAllInvoices,
	listInvoiceDetails,
	updateInvoice,
	getPayments,
};
