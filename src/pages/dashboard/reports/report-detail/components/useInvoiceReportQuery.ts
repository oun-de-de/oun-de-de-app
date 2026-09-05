import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import invoiceService from "@/core/api/services/invoice-service";
import type { InvoiceExportPreviewRow, PaymentResult } from "@/core/types/invoice";
import type { ReportDefinition } from "../report-types";
import { fetchAllInvoices, fetchAllPayments, normalizeCustomerText } from "./report-data-utils";
import type { ReportFiltersValue } from "./report-filters";
import { combineQueryStates } from "./report-query-utils";
import { mapExportLinesToPreviewRows } from "./report-table-builders";
import { normalizeReportFilters } from "./report-table-utils";

interface UseInvoiceReportQueryParams {
	definition: ReportDefinition;
	filters?: ReportFiltersValue;
	isInvoiceExport: boolean;
	hasRequiredDateFilters: boolean;
	customerId?: string;
	customerTypeId?: string;
	customerTypeCustomerNames: Set<string>;
}

export function useInvoiceReportQuery({
	definition,
	filters,
	isInvoiceExport,
	hasRequiredDateFilters,
	customerId,
	customerTypeId,
	customerTypeCustomerNames,
}: UseInvoiceReportQueryParams) {
	const { productName, reportDateFrom, reportDateTo } = normalizeReportFilters(filters);
	const isReceiptReport = definition.slug === "receipt-detail-by-customer";
	// customer-transaction-detail-by-type shows a receipt section alongside its invoices, and needs
	// the real payment records to fill it.
	const needsPayments = isReceiptReport || definition.slug === "customer-transaction-detail-by-type";
	const shouldBuildPreviewRows = definition.needsPreviewRows === true;

	const paymentQuery = useQuery({
		queryKey: [
			"report",
			"payment-list",
			definition.slug,
			customerId ?? "all",
			customerTypeId ?? "all-types",
			reportDateFrom ?? "",
			reportDateTo ?? "",
		],
		queryFn: () =>
			fetchAllPayments({
				customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: needsPayments && isInvoiceExport && hasRequiredDateFilters,
	});

	const invoiceQuery = useQuery({
		queryKey: [
			"report",
			"invoice-list",
			definition.slug,
			customerId ?? "all",
			customerTypeId ?? "all-types",
			reportDateFrom ?? "",
			reportDateTo ?? "",
		],
		queryFn: () =>
			fetchAllInvoices({
				sort: "date,desc",
				customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: !isReceiptReport && isInvoiceExport && hasRequiredDateFilters,
	});

	const baseQueryState = isReceiptReport
		? paymentQuery
		: combineQueryStates(invoiceQuery, needsPayments ? paymentQuery : {});

	const baseIsError = baseQueryState.isError;

	const invoices = useMemo(() => {
		if (baseIsError) return [];

		if (isReceiptReport) {
			if (!paymentQuery.data) return [];
			const list = paymentQuery.data.map((payment) => ({
				id: payment.id || payment.code || payment.refNo || "",
				refNo: payment.refNo || payment.code || payment.id || "-",
				customerName: payment.customerName || "Unknown Customer",
				date: payment.date || payment.paymentDate || "",
				type: "receipt",
				amount: payment.amount ?? payment.received ?? payment.originalAmount ?? 0,
				received: payment.received ?? payment.amount ?? 0,
				originalAmount: payment.originalAmount ?? payment.amount ?? 0,
				balance: payment.balance ?? 0,
				createdBy: payment.createdBy || "General Employee",
			}));
			return list.filter((item) => {
				if (customerTypeId) {
					return customerTypeCustomerNames.has(normalizeCustomerText(item.customerName));
				}
				return true;
			});
		}

		if (!invoiceQuery.data) return [];
		return invoiceQuery.data.filter((invoice) => {
			if (customerTypeId) {
				return customerTypeCustomerNames.has(normalizeCustomerText(invoice.customerName));
			}
			return true;
		});
	}, [baseIsError, customerTypeCustomerNames, customerTypeId, invoiceQuery.data, isReceiptReport, paymentQuery.data]);

	const invoiceIds = useMemo(() => {
		if (!isInvoiceExport || isReceiptReport || baseIsError) return [];
		return invoices.map((invoice) => invoice.id).filter(Boolean);
	}, [baseIsError, invoices, isInvoiceExport, isReceiptReport]);

	const exportQuery = useQuery({
		queryKey: ["report", "invoice-export", invoiceIds, productName ?? "all-products", customerTypeId ?? "all-types"],
		queryFn: () =>
			invoiceService.listInvoiceDetails(invoiceIds, {
				productName,
				referredBy: customerTypeId,
			}),
		enabled: !isReceiptReport && isInvoiceExport && invoiceIds.length > 0 && !baseIsError,
	});

	const totalQueryState = isReceiptReport
		? paymentQuery
		: combineQueryStates(invoiceQuery, needsPayments ? paymentQuery : {}, invoiceIds.length > 0 ? exportQuery : {});

	const totalIsError = totalQueryState.isError;

	const previewRows = useMemo<InvoiceExportPreviewRow[]>(
		() => (shouldBuildPreviewRows && !totalIsError ? mapExportLinesToPreviewRows(exportQuery.data ?? []) : []),
		[exportQuery.data, shouldBuildPreviewRows, totalIsError],
	);

	const payments = useMemo<PaymentResult[]>(() => {
		if (isReceiptReport || !paymentQuery.data || totalIsError) return [];
		return paymentQuery.data.filter((payment) => {
			if (customerTypeId) {
				return customerTypeCustomerNames.has(normalizeCustomerText(payment.customerName));
			}
			return true;
		});
	}, [customerTypeCustomerNames, customerTypeId, isReceiptReport, paymentQuery.data, totalIsError]);

	return {
		invoices,
		payments,
		invoiceIds,
		exportLines: totalIsError ? [] : (exportQuery.data ?? []),
		previewRows,
		isLoading: totalQueryState.isLoading,
		isError: totalIsError,
		refetch: totalQueryState.refetch,
	};
}
