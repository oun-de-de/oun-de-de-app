import { useMemo } from "react";
import type { SortMode } from "../../../invoice/export-preview/constants";
import type { ReportTemplateRow } from "../../components/layout/report-template-table";
import { getReportDefinition } from "../report-specs";
import {
	isAssetListDataSource,
	isCashTransactionApiDataSource,
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
import { getReportDateContext } from "./report-data-utils";
import type { ReportFiltersValue } from "./report-filters";
import { normalizeReportFilters, sortReportRows } from "./report-table-utils";
import { useAccountingReportQuery } from "./useAccountingReportQuery";
import { useDomainReportQuery } from "./useDomainReportQuery";
import { useInvoiceReportQuery } from "./useInvoiceReportQuery";

interface UseReportTableDataParams {
	reportSlug: string;
	filters?: ReportFiltersValue;
	sortMode: SortMode;
}

export function useReportTableData({ reportSlug, filters, sortMode }: UseReportTableDataParams) {
	// Get report definition and data source
	const definition = getReportDefinition(reportSlug);
	const dataSource = definition.dataSource ?? "invoice-export";
	const { customerId, customerTypeId } = normalizeReportFilters(filters);

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
	const isCashTransactionApi = isCashTransactionApiDataSource(dataSource);

	const { hasRequiredDateFilters, reportDate, reportPeriod, rangeDateFrom, rangeDateTo } = getReportDateContext(
		definition,
		filters,
	);

	// 1. Domain: Products, Customers, Loans, Cycles
	const domainData = useDomainReportQuery({
		definition,
		filters,
		hasRequiredDateFilters,
		isCustomerList,
		isProductList,
		isAssetList,
		isLoanList,
		isCycle,
		customerId,
		customerTypeId,
	});

	// 2. Domain: Invoices & Receipts
	const invoiceData = useInvoiceReportQuery({
		definition,
		filters,
		isInvoiceExport,
		hasRequiredDateFilters,
		customerId,
		customerTypeId,
		customerTypeCustomerNames: domainData.customerTypeCustomerNames,
	});

	// 3. Domain: Accounting (Daily, Monthly, Inventory)
	const accountingData = useAccountingReportQuery({
		definition,
		hasRequiredDateFilters,
		reportDate,
		reportPeriod,
		rangeDateFrom,
		rangeDateTo,
		isDailyReportApi,
		isInventoryStockReportApi,
		isMonthlyReportApi,
		isMonthlyReportDetailsApi,
		isCashTransactionApi,
	});

	const sourceRows = useMemo<ReportTemplateRow[]>(
		() =>
			definition.buildRows({
				invoices: invoiceData.invoices,
				payments: invoiceData.payments,
				exportLines: invoiceData.exportLines,
				previewRows: invoiceData.previewRows,
				cycles: domainData.cycles,
				filteredCustomers: domainData.filteredCustomers,
				allCustomers: domainData.customers,
				loanContent: domainData.loanContent,
				installmentsByLoanId: domainData.installmentsByLoanId,
				products: domainData.products,
				inventoryItems: domainData.inventoryItems,
				dailyReport: accountingData.dailyReport,
				inventoryStockReport: accountingData.inventoryStockReport,
				monthlyReport: accountingData.monthlyReport,
				monthlyReportDetails: accountingData.monthlyReportDetails,
				cashTransactionReport: accountingData.cashTransactionReport,
				rangeDateFrom,
				rangeDateTo,
				showDetail: filters?.showDetail ?? true,
				filters,
			}),
		[
			definition,
			filters,
			invoiceData.invoices,
			invoiceData.payments,
			invoiceData.exportLines,
			invoiceData.previewRows,
			domainData.cycles,
			domainData.filteredCustomers,
			domainData.customers,
			domainData.loanContent,
			domainData.installmentsByLoanId,
			domainData.products,
			domainData.inventoryItems,
			accountingData.dailyReport,
			accountingData.inventoryStockReport,
			accountingData.monthlyReport,
			accountingData.monthlyReportDetails,
			accountingData.cashTransactionReport,
			rangeDateFrom,
			rangeDateTo,
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

		const selectedCustomer = domainData.customers.find((customer) => customer.id === customerId);
		const fallbackCustomer = domainData.filteredCustomers.find((customer) => customer.id === customerId);
		return {
			selectedCustomer: selectedCustomer ?? fallbackCustomer,
			selectedCustomerLabel: selectedCustomer?.name ?? fallbackCustomer?.name ?? customerId,
		};
	}, [customerId, domainData.customers, domainData.filteredCustomers]);

	const selectedCustomerType = domainData.customers.find((c) => c.id === customerTypeId);
	const selectedCustomerTypeLabel = customerTypeId
		? selectedCustomerType
			? selectedCustomerType.code
				? `${selectedCustomerType.code} : ${selectedCustomerType.name}`
				: selectedCustomerType.name
			: "Unknown Type"
		: "All";

	return {
		definition,
		invoiceIds: invoiceData.invoiceIds,
		previewRows: invoiceData.previewRows,
		selectedCustomerLabel: selectedCustomerInfo.selectedCustomerLabel,
		selectedCustomer: selectedCustomerInfo.selectedCustomer,
		selectedCustomerTypeLabel,
		customerTypeCustomerCount: customerTypeId ? domainData.customerTypeCustomers.length : undefined,
		sourceRows,
		sortedRows,
		isLoading: domainData.isLoading || invoiceData.isLoading || accountingData.isLoading,
	};
}
