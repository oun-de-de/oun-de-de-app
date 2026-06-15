import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import invoiceService from "@/core/api/services/invoice-service";
import type { InvoiceExportPreviewRow } from "@/core/types/invoice";
import type { ReportDefinition } from "../report-types";
import { mapExportLinesToPreviewRows } from "./report-table-builders";
import { matchesInvoiceType, normalizeCustomerText } from "./report-data-utils";
import type { ReportFiltersValue } from "./report-filters";
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
	const { reportDateFrom, reportDateTo } = normalizeReportFilters(filters);
	const hasCustomerTypeFilter = Boolean(customerTypeId);
	const shouldBuildPreviewRows = definition.needsPreviewRows === true;

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
		enabled: isInvoiceExport && hasRequiredDateFilters,
	});

	const invoices = useMemo(() => {
		if (!invoiceQuery.data) return [];
		const invoiceType = definition.invoiceType;
		const invoiceList = invoiceQuery.data.list.filter((invoice) => {
			if (!customerId && customerTypeId) {
				return customerTypeCustomerNames.has(normalizeCustomerText(invoice.customerName));
			}
			return true;
		});
		if (!invoiceType) return invoiceList;

		return invoiceList.filter((invoice) => matchesInvoiceType(invoice, invoiceType));
	}, [customerId, customerTypeCustomerNames, customerTypeId, definition.invoiceType, invoiceQuery.data]);

	const invoiceIds = useMemo(() => {
		if (!isInvoiceExport || !invoiceQuery.data) return [];

		const invoiceType = definition.invoiceType;
		const filteredInvoices = invoiceQuery.data.list.filter((invoice) => {
			if (!customerId && customerTypeId) {
				return customerTypeCustomerNames.has(normalizeCustomerText(invoice.customerName));
			}
			return true;
		});
		const realInvoices = invoiceType
			? filteredInvoices.filter((invoice) => matchesInvoiceType(invoice, invoiceType))
			: filteredInvoices;

		return realInvoices.map((invoice) => invoice.id).filter(Boolean);
	}, [
		customerId,
		customerTypeCustomerNames,
		customerTypeId,
		definition.invoiceType,
		invoiceQuery.data,
		isInvoiceExport,
	]);

	const exportQuery = useQuery({
		queryKey: ["report", "invoice-export", invoiceIds],
		queryFn: () => invoiceService.listInvoiceDetails(invoiceIds),
		enabled: isInvoiceExport && invoiceIds.length > 0,
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
		isLoading: invoiceQuery.isLoading || exportQuery.isLoading,
	};
}
