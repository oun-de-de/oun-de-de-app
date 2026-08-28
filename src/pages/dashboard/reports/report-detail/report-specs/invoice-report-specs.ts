import { REPORT_TITLES } from "../../report-titles";
import {
	buildMonthlyRevenueExpenseApiRows,
	buildOpenInvoiceRows,
	buildReceiptDetailRows,
	buildSaleDetailRows,
} from "../components/report-table-builders";
import { REPORT_DEFAULT_DATE } from "../constants";
import { buildMonthlySummaryColumns } from "../report-columns/accounting-report-columns";
import {
	buildOpenInvoiceDetailColumns,
	buildReceiptDetailColumns,
	buildSaleDetailColumns,
} from "../report-columns/invoice-report-columns";
import { type BuildReportRowsParams, REPORT_FILTERS, type ReportDefinitionMap } from "../report-types";

function buildReceiptDetailReportRows({ invoices, previewRows, showDetail }: BuildReportRowsParams) {
	return buildReceiptDetailRows(invoices, previewRows, showDetail);
}

function buildOpenInvoiceDetailRows({ invoices, previewRows, showDetail }: BuildReportRowsParams) {
	return buildOpenInvoiceRows(invoices, previewRows, showDetail);
}

function buildSaleDetailReportRows({ invoices, exportLines }: BuildReportRowsParams) {
	return buildSaleDetailRows(invoices, exportLines);
}

function buildMonthlyRevenueExpenseApiReportRows({ monthlyReport }: BuildReportRowsParams) {
	return buildMonthlyRevenueExpenseApiRows(monthlyReport);
}

export const INVOICE_REPORT_SPECS: ReportDefinitionMap = {
	"open-invoice-detail-by-customer": {
		slug: "open-invoice-detail-by-customer",
		title: REPORT_TITLES["open-invoice-detail-by-customer"],
		templateId: "open-invoice-detail-by-customer",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildOpenInvoiceDetailColumns,
		buildRows: buildOpenInvoiceDetailRows,
		dataSource: "invoice-export",
		needsPreviewRows: true,
		filterConfig: {
			customer: true,
			customerType: true,
			dateRange: false,
			singleDate: true,
		},
	},
	"sale-detail-by-customer": {
		slug: "sale-detail-by-customer",
		title: REPORT_TITLES["sale-detail-by-customer"],
		templateId: "sale-detail-by-customer",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildSaleDetailColumns,
		buildRows: buildSaleDetailReportRows,
		dataSource: "invoice-export",
		filterConfig: {
			...REPORT_FILTERS.customerAndDateRange,
			customerType: true,
		},
	},
	"receipt-detail-by-customer": {
		slug: "receipt-detail-by-customer",
		title: REPORT_TITLES["receipt-detail-by-customer"],
		templateId: "receipt-detail-by-customer",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildReceiptDetailColumns,
		buildRows: buildReceiptDetailReportRows,
		dataSource: "invoice-export",
		needsPreviewRows: true,
		filterConfig: {
			...REPORT_FILTERS.customerAndDateRange,
			customerType: true,
		},
	},
	"profit-and-loss": {
		slug: "profit-and-loss",
		title: REPORT_TITLES["profit-and-loss"],
		templateId: "monthly-revenue-expense-summary",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildMonthlySummaryColumns,
		buildRows: buildMonthlyRevenueExpenseApiReportRows,
		dataSource: "monthly-report-api",
		filterConfig: REPORT_FILTERS.monthOnly,
	},
};
