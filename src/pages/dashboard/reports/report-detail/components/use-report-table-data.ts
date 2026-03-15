import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import customerService from "@/core/api/services/customer-service";
import cycleService from "@/core/api/services/cycle-service";
import invoiceService from "@/core/api/services/invoice-service";
import loanService from "@/core/api/services/loan-service";
import productService from "@/core/api/services/product-service";
import reportService from "@/core/api/services/report-service";
import { formatDateToYYYYMMDD, getTodayUTC } from "@/core/utils/date-utils";
import type { InvoiceExportPreviewRow } from "@/core/types/invoice";
import type { Installment } from "@/core/types/loan";
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
	isProductListDataSource,
} from "../report-types";
import type { ReportFiltersValue } from "./report-filters";
import {
	fallbackReportCustomers,
	fallbackReportExportLines,
	fallbackReportInstallmentsByLoanId,
	fallbackReportInvoices,
	fallbackReportLoans,
	fallbackReportProducts,
} from "./report-template-fallback-mocks";
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
	const shouldBuildPreviewRows = definition.needsPreviewRows === true;

	const isInvoiceExport = isInvoiceDataSource(dataSource);
	const isCycle = isCycleDataSource(dataSource);
	const isCustomerList = isCustomerListDataSource(dataSource);
	const isProductList = isProductListDataSource(dataSource);
	const isAssetList = isAssetListDataSource(dataSource);
	const isLoanList = isLoanListDataSource(dataSource);
	const isDailyReportApi = isDailyReportApiDataSource(dataSource);
	const isInventoryStockReportApi = isInventoryStockReportApiDataSource(dataSource);
	const defaultReportDate = formatDateToYYYYMMDD(getTodayUTC());
	const reportDate = (isDailyReportApi ? filters?.fromDate : undefined) || filters?.toDate || defaultReportDate;
	const inventoryDateFrom = filters?.fromDate || reportDate;
	const inventoryDateTo = filters?.toDate || inventoryDateFrom;
	const inventoryHistoryDateFrom = "1970-01-01";

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
		enabled: isCycle,
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
		enabled: isInvoiceExport,
	});

	const customerQuery = useQuery({
		queryKey: ["report", "customer-list", "all"],
		queryFn: () => customerService.getCustomerList({ limit: 10000 }),
		enabled:
			isCustomerList ||
			(isLoanList && definition.loanBorrowerType === "customer") ||
			Boolean(definition.filterConfig?.customer && customerId),
	});

	const productQuery = useQuery({
		queryKey: ["report", "product-list"],
		queryFn: () => productService.getProductList(),
		enabled: isProductList || isAssetList,
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
		enabled: isDailyReportApi,
	});

	const inventoryStockReportQuery = useQuery({
		queryKey: ["report", "inventory-stock-report", inventoryHistoryDateFrom, inventoryDateTo],
		queryFn: () => reportService.getInventoryStockReport(inventoryHistoryDateFrom, inventoryDateTo),
		enabled: isInventoryStockReportApi,
	});

	const loanInstallmentQueries = useQueries({
		queries: (loanQuery.data?.content ?? []).map((loan) => ({
			queryKey: ["report", "loan-installments", loan.id],
			queryFn: () => loanService.getInstallments(loan.id),
			enabled: isLoanList,
		})),
	});

	const customers = customerQuery.data ? customerQuery.data.list : fallbackReportCustomers;
	const filteredCustomers = useMemo(
		() => (customerId ? customers.filter((customer) => customer.id === customerId) : customers),
		[customerId, customers],
	);

	const installmentsByLoanId = useMemo<Record<string, Installment[]>>(
		() =>
			(loanQuery.data?.content ?? []).reduce<Record<string, Installment[]>>((acc, loan, index) => {
				acc[loan.id] = loanInstallmentQueries[index]?.data ?? [];
				return acc;
			}, {}),
		[loanInstallmentQueries, loanQuery.data?.content],
	);

	const invoices = useMemo(() => {
		if (!invoiceQuery.data) return fallbackReportInvoices;
		const invoiceType = definition.invoiceType;
		if (!invoiceType) return invoiceQuery.data.list;

		return invoiceQuery.data.list.filter((invoice) => matchesInvoiceType(invoice, invoiceType));
	}, [definition.invoiceType, invoiceQuery.data]);

	const invoiceIds = useMemo(
		() => (isInvoiceExport ? invoices.map((invoice) => invoice.id).filter(Boolean) : []),
		[invoices, isInvoiceExport],
	);

	const exportQuery = useQuery({
		queryKey: ["report", "invoice-export", invoiceIds],
		queryFn: () => invoiceService.listInvoiceDetails(invoiceIds),
		enabled: isInvoiceExport && invoiceIds.length > 0,
	});
	const exportLines = exportQuery.data ?? (invoiceQuery.data ? [] : fallbackReportExportLines);
	const products = productQuery.data ?? fallbackReportProducts;
	const loanContent = loanQuery.data ? loanQuery.data.content : fallbackReportLoans;
	const resolvedInstallmentsByLoanId = loanQuery.data ? installmentsByLoanId : fallbackReportInstallmentsByLoanId;

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
				dailyReport: dailyReportQuery.data,
				inventoryStockReport: inventoryStockReportQuery.data,
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
			inventoryStockReportQuery.data,
			loanContent,
			previewRows,
			products,
		],
	);

	const sortedRows = useMemo(() => sortReportRows(sourceRows, sortMode), [sourceRows, sortMode]);
	const selectedCustomerInfo = useMemo(() => {
		if (!customerId) {
			return {
				selectedCustomer: undefined,
				selectedCustomerLabel: "All",
			};
		}

		const selectedCustomer = customerQuery.data?.list.find((customer) => customer.id === customerId);
		return {
			selectedCustomer,
			selectedCustomerLabel: selectedCustomer?.name ?? "Filtered",
		};
	}, [customerId, customerQuery.data?.list]);

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
