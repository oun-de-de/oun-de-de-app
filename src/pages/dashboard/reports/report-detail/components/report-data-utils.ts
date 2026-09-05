import customerService from "@/core/api/services/customer-service";
import invoiceService from "@/core/api/services/invoice-service";
import loanService from "@/core/api/services/loan-service";
import type { Customer } from "@/core/types/customer";
import type { Invoice, PaymentResult } from "@/core/types/invoice";
import type { Loan } from "@/core/types/loan";
import { formatDateToYYYYMMDD } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import type { ReportDefinition } from "../report-types";
import type { ReportFiltersValue } from "./report-filters";

export function normalizeCustomerText(value?: string | null) {
	return (value ?? "").trim().toLowerCase();
}

export function matchesCustomerType(
	customer: { referredBy?: string | null },
	referrer?: { id: string; code?: string; name: string },
) {
	if (!referrer) return false;
	const referredBy = normalizeCustomerText(customer.referredBy);
	if (!referredBy) return false;
	return [referrer.id, referrer.code, referrer.name].some((value) => normalizeCustomerText(value) === referredBy);
}

/**
 * Customer Type limits which customers are selectable — "all" (or unset) means no limit.
 * Keep in sync with the AND semantics in useDomainReportQuery.filteredCustomers.
 */
export function getCustomersWithinType<
	T extends { id: string; code?: string; name: string; referredBy?: string | null },
>(customers: T[], customerTypeId?: string): T[] {
	if (!customerTypeId || normalizeCustomerText(customerTypeId) === "all") return customers;
	const referrer = customers.find((customer) => customer.id === customerTypeId);
	return customers.filter((customer) => matchesCustomerType(customer, referrer));
}

export interface FetchPageResult<T> {
	items: T[];
	totalPageCount: number;
}

export async function fetchPaginatedAll<T>(
	fetchPage: (page: number) => Promise<FetchPageResult<T>>,
	options: { pageBase?: 0 | 1 } = {},
): Promise<T[]> {
	const pageBase = options.pageBase ?? 1;

	const firstPage = await fetchPage(pageBase);

	if (firstPage.totalPageCount <= 1) {
		return firstPage.items;
	}

	const remainingPages = Array.from({ length: firstPage.totalPageCount - 1 }, (_, index) => pageBase + index + 1);

	const results = await Promise.all(remainingPages.map((page) => fetchPage(page)));

	return [...firstPage.items, ...results.flatMap((result) => result.items)];
}

export function fetchAllInvoices(params?: Parameters<typeof invoiceService.getInvoices>[0]): Promise<Invoice[]> {
	const pageSize = params?.size ?? 1000;
	return fetchPaginatedAll(
		async (page) => {
			const res = await invoiceService.getInvoices({
				...params,
				page,
				size: pageSize,
			});
			return {
				items: res.list,
				totalPageCount: res.pageCount,
			};
		},
		{ pageBase: 1 },
	);
}

export function fetchAllPayments(params?: Parameters<typeof invoiceService.getPayments>[0]): Promise<PaymentResult[]> {
	const pageSize = params?.size ?? 1000;
	return fetchPaginatedAll(
		async (page) => {
			const res = await invoiceService.getPayments({
				...params,
				page,
				size: pageSize,
			});
			return {
				items: res.list,
				totalPageCount: res.pageCount,
			};
		},
		{ pageBase: 1 },
	);
}

export function fetchAllCustomers(params?: Parameters<typeof customerService.getCustomerList>[0]): Promise<Customer[]> {
	const pageSize = params?.limit ?? 1000;
	return fetchPaginatedAll(
		async (page) => {
			const res = await customerService.getCustomerList({
				...params,
				page,
				limit: pageSize,
			});
			return {
				items: res.list,
				totalPageCount: res.pageCount,
			};
		},
		{ pageBase: 1 },
	);
}

export function fetchAllLoans(params?: Parameters<typeof loanService.getLoans>[0]): Promise<Loan[]> {
	const pageSize = params?.size ?? 1000;
	return fetchPaginatedAll(
		async (page) => {
			const res = await loanService.getLoans({
				...params,
				page,
				size: pageSize,
			});
			return {
				items: res.content,
				totalPageCount: res.totalPages,
			};
		},
		{ pageBase: 0 },
	);
}

export function getReportDateContext(definition: ReportDefinition, filters?: ReportFiltersValue) {
	const isDailyReportApi = definition.dataSource === "daily-report-api";
	const isMonthFilter = definition.filterConfig?.monthOnly === true;
	const requiresSingleDate = definition.filterConfig?.singleDate === true;
	const requiresDateRange = definition.filterConfig?.dateRange === true;
	const requiresMonth = definition.filterConfig?.monthOnly === true;

	const defaultReportDate = formatDateToYYYYMMDD(new Date());
	const defaultReportPeriod = defaultReportDate.slice(0, 7);

	const hasRequiredDateFilters =
		requiresMonth || requiresSingleDate
			? Boolean(filters?.fromDate)
			: requiresDateRange
				? Boolean(filters?.fromDate && filters?.toDate)
				: true;

	const reportDate = (isDailyReportApi ? filters?.fromDate : undefined) || filters?.toDate || defaultReportDate;
	const reportPeriod = isMonthFilter
		? filters?.fromDate || filters?.toDate || defaultReportPeriod
		: (filters?.toDate || filters?.fromDate || defaultReportDate).slice(0, 7);

	const rangeDateFrom = filters?.fromDate || reportDate;
	const rangeDateTo = filters?.toDate || rangeDateFrom;

	return {
		hasRequiredDateFilters,
		reportDate,
		reportPeriod,
		rangeDateFrom,
		rangeDateTo,
	};
}
