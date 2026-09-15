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
	// open-invoice-detail-by-customer and customer-transaction-detail-by-type both fetch payments by
	// cycleId (POST /query-payments) once previewRows are known (below) — payments have no invoiceId,
	// only cycleId (verified against live OpenAPI spec + curl, 2026-09-15). Confirmed 2026-09-16:
	// customer-transaction-detail-by-type now uses the same mechanism instead of a customer/date
	// /payments fetch, so its Receipt section is scoped to the same cycles as the displayed invoices.
	const usesCyclePayments =
		definition.slug === "open-invoice-detail-by-customer" || definition.slug === "customer-transaction-detail-by-type";
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
		enabled: isReceiptReport && isInvoiceExport && hasRequiredDateFilters,
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

	const baseQueryState = isReceiptReport ? paymentQuery : invoiceQuery;

	const baseIsError = baseQueryState.isError;

	const invoices = useMemo(() => {
		if (baseIsError) return [];

		if (isReceiptReport) {
			if (!paymentQuery.data) return [];
			// PaymentResult carries customerName (confirmed live, 2026-09-16); refNo/received/etc. still
			// don't exist on the real API, so those keep their placeholder fallbacks below.
			const list = paymentQuery.data.map((payment) => ({
				id: payment.id || payment.code || "",
				refNo: payment.code || payment.id || "-",
				customerName: (payment.customerName ?? "").trim() || "Unknown Customer",
				date: payment.paymentDate || "",
				type: "receipt",
				amount: payment.amount ?? 0,
				received: payment.amount ?? 0,
				originalAmount: payment.amount ?? 0,
				balance: 0,
				createdBy: "General Employee",
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

	const previewRows = useMemo<InvoiceExportPreviewRow[]>(
		() => (shouldBuildPreviewRows && !exportQuery.isError ? mapExportLinesToPreviewRows(exportQuery.data ?? []) : []),
		[exportQuery.data, exportQuery.isError, shouldBuildPreviewRows],
	);

	const cycleIds = useMemo(() => {
		if (!usesCyclePayments) return [];
		const ids = new Set<string>();
		for (const row of previewRows) {
			if (row.cycleId) ids.add(row.cycleId);
		}
		return [...ids];
	}, [usesCyclePayments, previewRows]);

	const cyclePaymentQuery = useQuery({
		queryKey: ["report", "payment-list-by-cycle", definition.slug, cycleIds],
		queryFn: () => invoiceService.queryPaymentsByCycle(cycleIds).then((res) => res.list),
		enabled: usesCyclePayments && cycleIds.length > 0,
	});

	const totalQueryState = isReceiptReport
		? paymentQuery
		: combineQueryStates(
				invoiceQuery,
				invoiceIds.length > 0 ? exportQuery : {},
				cycleIds.length > 0 ? cyclePaymentQuery : {},
			);

	const totalIsError = totalQueryState.isError;

	const payments = useMemo<PaymentResult[]>(() => {
		if (totalIsError) return [];
		if (usesCyclePayments) return cyclePaymentQuery.data ?? [];
		if (isReceiptReport || !paymentQuery.data) return [];
		// PaymentResult now carries customerName (confirmed live, 2026-09-16), but this branch still
		// doesn't filter payments by customer type client-side. Deferred task tracks the real fix.
		return paymentQuery.data;
	}, [cyclePaymentQuery.data, usesCyclePayments, isReceiptReport, paymentQuery.data, totalIsError]);

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
