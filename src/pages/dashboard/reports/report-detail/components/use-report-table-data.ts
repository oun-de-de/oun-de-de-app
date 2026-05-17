import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import customerService from "@/core/api/services/customer-service";
import cycleService from "@/core/api/services/cycle-service";
import inventoryService from "@/core/api/services/inventory-service";
import invoiceService from "@/core/api/services/invoice-service";
import loanService from "@/core/api/services/loan-service";
import productService from "@/core/api/services/product-service";
import reportService from "@/core/api/services/report-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import { PRODUCT_QUERY_KEYS } from "@/core/query-keys/product-query-keys";
import { formatDateToYYYYMMDD } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import type { InvoiceExportPreviewRow } from "@/core/types/invoice";
import type { SortMode } from "../../../invoice/export-preview/constants";
import type { ReportTemplateRow } from "../../components/layout/report-template-table";
import { getReportDefinition } from "../report-specs";
import {
	isAssetListDataSource,
	isCustomerListDataSource,
	isCycleDataSource,
	isDailyReportApiDataSource,
	isInventoryStockReportApiDataSource,
	isInvoiceDataSource,
	isLoanListDataSource,
	isMonthlyReportApiDataSource,
	isMonthlyReportDetailsApiDataSource,
	isProductListDataSource,
} from "../report-types";
import type { ReportFiltersValue } from "./report-filters";

import { mapExportLinesToPreviewRows } from "./report-table-builders";
import { normalizeReportFilters, sortReportRows } from "./report-table-utils";

function normalizeInvoiceType(value: string | null | undefined) {
	return (value ?? "").trim().toLowerCase();
}

function isReceiptRefNo(refNo: string | null | undefined) {
	return /^(rec|rcp|rc)/i.test((refNo ?? "").trim());
}

function matchesInvoiceType(
	invoice: { refNo?: string | null; type?: string | null },
	expectedType: "invoice" | "receipt",
) {
	const normalizedType = normalizeInvoiceType(invoice.type);
	if (normalizedType === "receipt" || normalizedType === "invoice") {
		return normalizedType === expectedType;
	}

	return expectedType === "receipt" ? isReceiptRefNo(invoice.refNo) : !isReceiptRefNo(invoice.refNo);
}

interface UseReportTableDataParams {
	reportSlug: string;
	filters?: ReportFiltersValue;
	sortMode: SortMode;
}

export function useReportTableData({ reportSlug, filters, sortMode }: UseReportTableDataParams) {
	const definition = getReportDefinition(reportSlug);
	const dataSource = definition.dataSource ?? "invoice-export";
	const { customerId, reportDateFrom, reportDateTo } = normalizeReportFilters(filters);
	const isMonthFilter = definition.filterConfig?.monthOnly === true;
	const requiresSingleDate = definition.filterConfig?.singleDate === true;
	const requiresDateRange = definition.filterConfig?.dateRange === true;
	const requiresMonth = definition.filterConfig?.monthOnly === true;
	const shouldBuildPreviewRows = definition.needsPreviewRows === true;

	const isInvoiceExport = isInvoiceDataSource(dataSource);
	const isCycle = isCycleDataSource(dataSource);
	const isCustomerList = isCustomerListDataSource(dataSource);
	const isProductList = isProductListDataSource(dataSource);
	const isAssetList = isAssetListDataSource(dataSource);
	const isLoanList = isLoanListDataSource(dataSource);
	const isDailyReportApi = isDailyReportApiDataSource(dataSource);
	const isInventoryStockReportApi = isInventoryStockReportApiDataSource(dataSource);
	const isMonthlyReportApi = isMonthlyReportApiDataSource(dataSource);
	const isMonthlyReportDetailsApi = isMonthlyReportDetailsApiDataSource(dataSource);
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
	const inventoryDateFrom = filters?.fromDate || reportDate;
	const inventoryDateTo = filters?.toDate || inventoryDateFrom;
	const customerListParams = { limit: 10000 };

	const cycleQuery = useQuery({
		queryKey: ["report", "cycle-list", customerId ?? "all", reportDateFrom ?? "", reportDateTo ?? ""],
		queryFn: () =>
			cycleService.getCycles({
				page: 1,
				size: 10000,
				sort: "startDate,desc",
				customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: isCycle && hasRequiredDateFilters,
	});

	const invoiceQuery = useQuery({
		queryKey: ["report", "invoice-list", reportSlug, customerId ?? "all", reportDateFrom ?? "", reportDateTo ?? ""],
		queryFn: () =>
			invoiceService.getInvoices({
				page: 1,
				size: 10000,
				sort: "date,desc",
				customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: isInvoiceExport && hasRequiredDateFilters,
	});

	const customerQuery = useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.list(customerListParams),
		queryFn: () => customerService.getCustomerList(customerListParams),
		enabled:
			isCustomerList ||
			(isLoanList && definition.loanBorrowerType === "customer") ||
			Boolean(definition.filterConfig?.customer && customerId),
	});

	const productQuery = useQuery({
		queryKey: PRODUCT_QUERY_KEYS.list(),
		queryFn: () => productService.getProductList(),
		enabled: isProductList,
	});

	const inventoryItemsQuery = useQuery({
		queryKey: ["report", "inventory-items"],
		queryFn: () => inventoryService.getItems({}),
		enabled: isAssetList,
	});

	const loanQuery = useQuery({
		queryKey: [
			"report",
			"loan-list",
			definition.loanBorrowerType ?? "customer",
			customerId ?? "all",
			reportDateFrom ?? "",
			reportDateTo ?? "",
		],
		queryFn: () =>
			loanService.getLoans({
				borrower_type: definition.loanBorrowerType,
				borrower_id: definition.loanBorrowerType === "customer" ? customerId : undefined,
				from: reportDateFrom,
				to: reportDateTo,
				page: 1,
				size: 10000,
				sort: "createAt,desc",
			}),
		enabled: isLoanList,
	});

	const dailyReportQuery = useQuery({
		queryKey: ["report", "daily-report", reportDate],
		queryFn: () => reportService.getDailyReport(reportDate),
		enabled: isDailyReportApi && hasRequiredDateFilters,
	});

	const inventoryStockReportQuery = useQuery({
		queryKey: ["report", "inventory-stock-report", inventoryDateFrom, inventoryDateTo],
		queryFn: () => reportService.getInventoryStockReport(inventoryDateFrom, inventoryDateTo),
		enabled: isInventoryStockReportApi && hasRequiredDateFilters,
	});

	const monthlyReportQuery = useQuery({
		queryKey: ["report", "monthly-report", reportPeriod],
		queryFn: () => reportService.getMonthlyReport(reportPeriod),
		enabled: isMonthlyReportApi && hasRequiredDateFilters,
	});

	const monthlyReportDetailsQuery = useQuery({
		queryKey: ["report", "monthly-report-details", reportPeriod],
		queryFn: () => reportService.getMonthlyReportDetails(reportPeriod),
		enabled: isMonthlyReportDetailsApi && hasRequiredDateFilters,
	});

	const customers = customerQuery.data?.list ?? [];
	const filteredCustomers = useMemo(
		() => (customerId ? customers.filter((customer) => customer.id === customerId) : customers),
		[customerId, customers],
	);

	const installmentsByLoanId = useMemo(
		() =>
			// Temporarily keep report loan schedules empty until backend exposes the real installment schedule.
			// Synthetic installments were removed because they could diverge from actual payment behavior
			// when users pay early, pay partial amounts, extend loans, or change terms mid-loan.
			(loanQuery.data?.content ?? []).reduce<Record<string, []>>((acc, loan) => {
				acc[loan.id] = [];
				return acc;
			}, {}),
		[loanQuery.data?.content],
	);

	const invoices = useMemo(() => {
		if (!invoiceQuery.data) return [];
		const invoiceType = definition.invoiceType;
		if (!invoiceType) return invoiceQuery.data.list;

		return invoiceQuery.data.list.filter((invoice) => matchesInvoiceType(invoice, invoiceType));
	}, [definition.invoiceType, invoiceQuery.data]);

	const invoiceIds = useMemo(() => {
		if (!isInvoiceExport || !invoiceQuery.data) return [];

		const invoiceType = definition.invoiceType;
		const realInvoices = invoiceType
			? invoiceQuery.data.list.filter((invoice) => matchesInvoiceType(invoice, invoiceType))
			: invoiceQuery.data.list;

		return realInvoices.map((invoice) => invoice.id).filter(Boolean);
	}, [definition.invoiceType, invoiceQuery.data, isInvoiceExport]);

	const exportQuery = useQuery({
		queryKey: ["report", "invoice-export", invoiceIds],
		queryFn: () => invoiceService.listInvoiceDetails(invoiceIds),
		enabled: isInvoiceExport && invoiceIds.length > 0,
	});
	const exportLines = exportQuery.data ?? [];
	const products = productQuery.data ?? [];
	const loanContent = loanQuery.data?.content ?? [];
	const resolvedInstallmentsByLoanId = loanQuery.data ? installmentsByLoanId : {};

	const previewRows = useMemo<InvoiceExportPreviewRow[]>(
		() => (shouldBuildPreviewRows ? mapExportLinesToPreviewRows(exportLines) : []),
		[exportLines, shouldBuildPreviewRows],
	);

	const sourceRows = useMemo<ReportTemplateRow[]>(
		() =>
			definition.buildRows({
				invoices,
				exportLines,
				previewRows,
				cycles: cycleQuery.data?.list ?? [],
				filteredCustomers,
				allCustomers: customers,
				loanContent,
				installmentsByLoanId: resolvedInstallmentsByLoanId,
				products,
				inventoryItems: inventoryItemsQuery.data,
				dailyReport: dailyReportQuery.data,
				inventoryStockReport: inventoryStockReportQuery.data,
				monthlyReport: monthlyReportQuery.data,
				monthlyReportDetails: monthlyReportDetailsQuery.data,
				inventoryDateFrom,
				inventoryDateTo,
			}),
		[
			cycleQuery.data?.list,
			customers,
			dailyReportQuery.data,
			definition,
			exportLines,
			filteredCustomers,
			invoices,
			resolvedInstallmentsByLoanId,
			inventoryDateFrom,
			inventoryDateTo,
			inventoryItemsQuery.data,
			inventoryStockReportQuery.data,
			loanContent,
			monthlyReportDetailsQuery.data,
			monthlyReportQuery.data,
			previewRows,
			products,
		],
	);

	const sortedRows = useMemo(() => sortReportRows(sourceRows, sortMode), [sourceRows, sortMode]);
	const selectedCustomerInfo = useMemo(() => {
		if (!customerId) {
			return {
				selectedCustomer: undefined,
				selectedCustomerLabel: "All Customers",
			};
		}

		const selectedCustomer = customerQuery.data?.list.find((customer) => customer.id === customerId);
		const fallbackCustomer = filteredCustomers.find((customer) => customer.id === customerId);
		return {
			selectedCustomer: selectedCustomer ?? fallbackCustomer,
			selectedCustomerLabel: selectedCustomer?.name ?? fallbackCustomer?.name ?? customerId,
		};
	}, [customerId, customerQuery.data?.list, filteredCustomers]);

	return {
		definition,
		invoiceIds,
		previewRows,
		selectedCustomerLabel: selectedCustomerInfo.selectedCustomerLabel,
		selectedCustomer: selectedCustomerInfo.selectedCustomer,
		sourceRows,
		sortedRows,
	};
}
