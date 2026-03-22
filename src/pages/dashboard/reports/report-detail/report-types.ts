import type { Customer } from "@/core/types/customer";
import type { Cycle } from "@/core/types/cycle";
import type { Invoice, InvoiceExportLineApi, InvoiceExportPreviewRow } from "@/core/types/invoice";
import type { BorrowerType, Installment, Loan } from "@/core/types/loan";
import type { InventoryItem } from "@/core/types/inventory";
import type { Product } from "@/core/types/product";
import type {
	DailyReportResponse,
	InventoryStockReportLine,
	MonthlyReportDetailsResponse,
	MonthlyReportResponse,
} from "@/core/types/report";
import type {
	ReportTemplateColumn,
	ReportTemplateRow,
	ReportTemplateSummaryRow,
} from "../components/layout/report-template-table";
import type { ReportColumnOption, ReportColumnVisibility } from "../components/layout/report-toolbar";

export type ReportDataSource =
	| "invoice-export"
	| "cycle"
	| "customer-list"
	| "product-list"
	| "loan-list"
	| "accounting-mock"
	| "invoice-summary"
	| "daily-report-api"
	| "inventory-stock-report-api"
	| "monthly-report-api"
	| "monthly-report-details-api"
	| "asset-list"
	| "unsupported";

export type ReportTemplateId =
	| "monthly-revenue-expense-summary"
	| "income-expense-ledger"
	| "daily-report-summary"
	| "company-asset-register"
	| "ice-bag-inventory-stock-report"
	| "employee-loan-ledger"
	| "customer-loan-register"
	| "open-invoice-detail-by-customer"
	| "sale-detail-by-customer"
	| "customer-list"
	| "cycle-summary"
	| "receipt-detail-by-customer"
	| "unsupported";

export type ReportInvoiceType = "invoice" | "receipt";

export interface ReportFilterConfig {
	customer: boolean;
	dateRange: boolean;
	singleDate?: boolean;
	monthOnly?: boolean;
}

export const REPORT_FILTERS = {
	customerAndDateRange: { customer: true, dateRange: true },
	customerOnly: { customer: true, dateRange: false },
	dateRangeOnly: { customer: false, dateRange: true },
	noFilters: { customer: false, dateRange: false },
	singleDateOnly: { customer: false, dateRange: false, singleDate: true },
	monthOnly: { customer: false, dateRange: false, monthOnly: true },
} satisfies Record<string, ReportFilterConfig>;

export interface ReportDefinition {
	slug: string;
	title: string;
	templateId: ReportTemplateId;
	subtitle?: string;
	buildColumns: () => ReportTemplateColumn[];
	buildRows: (params: BuildReportRowsParams) => ReportTemplateRow[];
	summaryRows?: ReportTemplateSummaryRow[];
	dataSource?: ReportDataSource;
	needsPreviewRows?: boolean;
	invoiceType?: ReportInvoiceType;
	loanBorrowerType?: BorrowerType;
	emptyText?: string;
	filterConfig?: ReportFilterConfig;
}

export type ReportDefinitionMap = Record<string, ReportDefinition>;

export interface BuildReportRowsParams {
	invoices: Invoice[];
	exportLines: InvoiceExportLineApi[];
	previewRows: InvoiceExportPreviewRow[];
	cycles: Cycle[];
	filteredCustomers: Customer[];
	allCustomers: Customer[];
	loanContent: Loan[];
	installmentsByLoanId: Record<string, Installment[]>;
	products: Product[];
	inventoryItems?: InventoryItem[];
	dailyReport?: DailyReportResponse;
	inventoryStockReport?: InventoryStockReportLine[];
	monthlyReport?: MonthlyReportResponse;
	monthlyReportDetails?: MonthlyReportDetailsResponse;
	inventoryDateFrom?: string;
	inventoryDateTo?: string;
}

export function getReportColumnOptions(definition: ReportDefinition): ReportColumnOption[] {
	return definition.buildColumns().map((column) => ({
		key: column.id,
		label: typeof column.header === "string" ? column.header : column.id,
	}));
}

export function createVisibleColumnMap(columnOptions: ReportColumnOption[]): ReportColumnVisibility {
	return Object.fromEntries(columnOptions.map((option) => [option.key, true]));
}

export function isInvoiceDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "invoice-export" || dataSource === "invoice-summary";
}

export function isDailyReportApiDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "daily-report-api";
}

export function isInventoryStockReportApiDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "inventory-stock-report-api";
}

export function isMonthlyReportApiDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "monthly-report-api";
}

export function isMonthlyReportDetailsApiDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "monthly-report-details-api";
}

export function isCycleDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "cycle";
}

export function isCustomerListDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "customer-list";
}

export function isProductListDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "product-list";
}

export function isAssetListDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "asset-list";
}

export function isLoanListDataSource(dataSource: ReportDataSource): boolean {
	return dataSource === "loan-list";
}

export function hasVisibleReportFilters(filterConfig?: ReportFilterConfig): boolean {
	return (
		!!filterConfig &&
		(filterConfig.customer || filterConfig.dateRange || !!filterConfig.singleDate || !!filterConfig.monthOnly)
	);
}
