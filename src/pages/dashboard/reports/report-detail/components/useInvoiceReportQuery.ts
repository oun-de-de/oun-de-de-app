import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import invoiceService from "@/core/api/services/invoice-service";
import type { InvoiceExportPreviewRow } from "@/core/types/invoice";
import type { ReportDefinition } from "../report-types";
import { normalizeCustomerText } from "./report-data-utils";
import type { ReportFiltersValue } from "./report-filters";
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
	const hasCustomerTypeFilter = Boolean(customerTypeId);
	const isReceiptReport = definition.slug === "receipt-detail-by-customer";
	const shouldBuildPreviewRows = definition.needsPreviewRows === true;

	const paymentQuery = useQuery({
		queryKey: [
			"report",
			"payment-list",
			definition.slug,
			hasCustomerTypeFilter ? "all" : (customerId ?? "all"),
			customerTypeId ?? "all-types",
			reportDateFrom ?? "",
			reportDateTo ?? "",
		],
		queryFn: () =>
			invoiceService.getPayments({
				page: 1,
				size: 10000,
				customerId: hasCustomerTypeFilter ? undefined : customerId,
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
			hasCustomerTypeFilter ? "all" : (customerId ?? "all"),
			customerTypeId ?? "all-types",
			reportDateFrom ?? "",
			reportDateTo ?? "",
		],
		queryFn: () =>
			invoiceService.getInvoices({
				page: 1,
				size: 10000,
				sort: "date,desc",
				customerId: hasCustomerTypeFilter ? undefined : customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: !isReceiptReport && isInvoiceExport && hasRequiredDateFilters,
	});

	const invoices = useMemo(() => {
		if (isReceiptReport) {
			if (!paymentQuery.data) return [];
			const list = paymentQuery.data.list.map((payment) => ({
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
				if (!customerId && customerTypeId) {
					return customerTypeCustomerNames.has(normalizeCustomerText(item.customerName));
				}
				return true;
			});
		}

		if (!invoiceQuery.data) return [];
		return invoiceQuery.data.list.filter((invoice) => {
			if (!customerId && customerTypeId) {
				return customerTypeCustomerNames.has(normalizeCustomerText(invoice.customerName));
			}
			return true;
		});
	}, [customerId, customerTypeCustomerNames, customerTypeId, invoiceQuery.data, isReceiptReport, paymentQuery.data]);

	const invoiceIds = useMemo(() => {
		if (!isInvoiceExport || isReceiptReport) return [];
		return invoices.map((invoice) => invoice.id).filter(Boolean);
	}, [invoices, isInvoiceExport, isReceiptReport]);

	const invoiceIdsFingerprint = useMemo(() => {
		if (invoiceIds.length === 0) return "empty";
		return `${invoiceIds.length}:${invoiceIds[0]}:${invoiceIds[invoiceIds.length - 1]}`;
	}, [invoiceIds]);

	const exportQuery = useQuery({
		queryKey: [
			"report",
			"invoice-export",
			invoiceIdsFingerprint,
			productName ?? "all-products",
			customerTypeId ?? "all-types",
		],
		queryFn: () =>
			invoiceService.listInvoiceDetails(invoiceIds, {
				productName,
				referredBy: customerTypeId,
			}),
		enabled: !isReceiptReport && isInvoiceExport && invoiceIds.length > 0,
	});

	const previewRows = useMemo<InvoiceExportPreviewRow[]>(
		() => (shouldBuildPreviewRows ? mapExportLinesToPreviewRows(exportQuery.data ?? []) : []),
		[exportQuery.data, shouldBuildPreviewRows],
	);

	return {
		invoices,
		invoiceIds,
		exportLines: exportQuery.data ?? [],
		previewRows,
		isLoading:
			(isReceiptReport ? paymentQuery.isLoading : invoiceQuery.isLoading) ||
			(!isReceiptReport && exportQuery.isLoading),
	};
}
