import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import customerService from "@/core/api/services/customer-service";
import cycleService from "@/core/api/services/cycle-service";
import invoiceService from "@/core/api/services/invoice-service";
import loanService from "@/core/api/services/loan-service";
import productService from "@/core/api/services/product-service";
import type { InvoiceExportPreviewRow } from "@/core/types/invoice";
import type { Installment } from "@/core/types/loan";
import type { SortMode } from "../../../invoice/export-preview/constants";
import type { ReportTemplateRow } from "../../components/layout/report-template-table";
import { getReportDefinition } from "../report-registry";
import type { ReportFiltersValue } from "./report-filters";
import {
	buildCompanyAssetRows,
	buildCustomerListRows,
	buildCustomerLoanRows,
	buildCustomerTransactionRows,
	buildCycleReportRows,
	buildEmployeeLoanRows,
	buildInventoryBagRows,
	buildInvoiceReportRows,
	buildInvoiceSummaryRows,
	buildLedgerRows,
	buildProductListRows,
	buildSaleDetailRows,
	buildTrialBalanceRows,
	mapExportLinesToPreviewRows,
} from "./report-table-builders";
import { normalizeReportFilters, sortReportRows } from "./report-table-utils";

interface UseReportTableDataParams {
	reportSlug: string;
	filters?: ReportFiltersValue;
	sortMode: SortMode;
}

export function useReportTableData({ reportSlug, filters, sortMode }: UseReportTableDataParams) {
	const definition = getReportDefinition(reportSlug);
	const dataSource = definition.dataSource ?? "invoice-export";
	const { customerId, reportDateFrom, reportDateTo } = normalizeReportFilters(filters);

	const isInvoiceExport = dataSource === "invoice-export" || dataSource === "invoice-summary";
	const isCycle = dataSource === "cycle";
	const isCustomerList = dataSource === "customer-list";
	const isProductList = dataSource === "product-list";
	const isAssetList = dataSource === "asset-list";
	const isLoanList = dataSource === "loan-list";
	const isAccountingMock = dataSource === "accounting-mock";
	const isUnsupported = dataSource === "unsupported";
	const isSimpleTransactionReport = reportSlug === "customer-transaction";

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
				type: definition.invoiceType,
				customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: isInvoiceExport,
	});

	const invoiceIds = useMemo(
		() => (isInvoiceExport ? (invoiceQuery.data?.list ?? []).map((invoice) => invoice.id) : []),
		[isInvoiceExport, invoiceQuery.data?.list],
	);

	const exportQuery = useQuery({
		queryKey: ["report", "invoice-export", invoiceIds],
		queryFn: () => invoiceService.exportInvoice(invoiceIds),
		enabled: isInvoiceExport && !isSimpleTransactionReport && invoiceIds.length > 0,
	});

	const customerQuery = useQuery({
		queryKey: ["report", "customer-list", customerId ?? "all"],
		queryFn: () => customerService.getCustomerList({ limit: 10000 }),
		enabled: isCustomerList || (isLoanList && definition.loanBorrowerType === "customer"),
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

	const loanInstallmentQueries = useQueries({
		queries: (loanQuery.data?.content ?? []).map((loan) => ({
			queryKey: ["report", "loan-installments", loan.id],
			queryFn: () => loanService.getInstallments(loan.id),
			enabled: isLoanList,
		})),
	});

	const filteredCustomers = useMemo(() => {
		const customers = customerQuery.data?.list ?? [];
		return customerId ? customers.filter((customer) => customer.id === customerId) : customers;
	}, [customerId, customerQuery.data?.list]);

	const installmentsByLoanId = useMemo<Record<string, Installment[]>>(
		() =>
			(loanQuery.data?.content ?? []).reduce<Record<string, Installment[]>>((acc, loan, index) => {
				acc[loan.id] = loanInstallmentQueries[index]?.data ?? [];
				return acc;
			}, {}),
		[loanInstallmentQueries, loanQuery.data?.content],
	);

	const previewRows = useMemo<InvoiceExportPreviewRow[]>(
		() => mapExportLinesToPreviewRows(exportQuery.data ?? []),
		[exportQuery.data],
	);

	const sourceRows = useMemo<ReportTemplateRow[]>(() => {
		if (isInvoiceExport) {
			if (reportSlug === "sale-detail-by-customer") return buildSaleDetailRows(exportQuery.data ?? []);
			if (reportSlug === "profit-and-loss") return buildInvoiceSummaryRows(previewRows, "monthly");
			if (reportSlug === "daily-report") return buildInvoiceSummaryRows(previewRows, "daily");
			if (isSimpleTransactionReport) return buildCustomerTransactionRows(invoiceQuery.data?.list ?? []);
			return buildInvoiceReportRows(exportQuery.data ?? []);
		}

		if (isCycle) return buildCycleReportRows(cycleQuery.data?.list ?? []);
		if (isCustomerList) return buildCustomerListRows(filteredCustomers);
		if (isLoanList) {
			return definition.loanBorrowerType === "employee"
				? buildEmployeeLoanRows(loanQuery.data?.content ?? [], installmentsByLoanId)
				: buildCustomerLoanRows(loanQuery.data?.content ?? [], customerQuery.data?.list ?? [], installmentsByLoanId);
		}
		if (isAssetList) return buildCompanyAssetRows(productQuery.data ?? []);
		if (isProductList) {
			return reportSlug === "inventory-stock-status"
				? buildInventoryBagRows(productQuery.data ?? [])
				: buildProductListRows(productQuery.data ?? []);
		}
		if (isAccountingMock) return reportSlug === "trial-balance" ? buildTrialBalanceRows() : buildLedgerRows();
		if (isUnsupported) return [];
		return [];
	}, [
		customerQuery.data?.list,
		cycleQuery.data?.list,
		definition.loanBorrowerType,
		exportQuery.data,
		filteredCustomers,
		invoiceQuery.data?.list,
		isAccountingMock,
		isAssetList,
		isCustomerList,
		isCycle,
		isInvoiceExport,
		isLoanList,
		isProductList,
		isSimpleTransactionReport,
		isUnsupported,
		installmentsByLoanId,
		loanQuery.data?.content,
		previewRows,
		productQuery.data,
		reportSlug,
	]);

	const sortedRows = useMemo(() => sortReportRows(sourceRows, sortMode), [sourceRows, sortMode]);

	return {
		definition,
		invoiceIds,
		previewRows,
		sortedRows,
	};
}
