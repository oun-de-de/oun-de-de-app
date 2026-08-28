import type {
	CashTransactionReportResponse,
	CustomerTransactionDetailGroup,
	DailyReportResponse,
	InventoryStockReportLine,
	MonthlyReportDetailsResponse,
	MonthlyReportResponse,
	OpenInvoiceCustomerGroup,
} from "@/core/types/report";
import { apiClient } from "../apiClient";

enum REPORT_API {
	DAILY_REPORT = "/reports/daily-report",
	INVENTORY_STOCK_REPORT = "/reports/inventory-stock-report",
	MONTHLY_REPORT = "/reports/monthly-report",
	MONTHLY_REPORT_DETAILS = "/reports/monthly-report-details",
	CASH_TRANSACTION_REPORT = "/reports/cash-transaction-report",
	CUSTOMER_TRANSACTION_DETAIL_REPORT = "/reports/customer-transaction-detail-report",
	OPEN_INVOICE_REPORT = "/reports/open-invoice-report",
}

const getDailyReport = (date: string) =>
	apiClient.get<DailyReportResponse>({
		url: REPORT_API.DAILY_REPORT,
		params: { date },
	});

const getInventoryStockReport = (fromDate: string, toDate: string) =>
	apiClient.get<InventoryStockReportLine[]>({
		url: REPORT_API.INVENTORY_STOCK_REPORT,
		params: { fromDate, toDate },
	});

const getMonthlyReport = (period: string) =>
	apiClient.get<MonthlyReportResponse>({
		url: REPORT_API.MONTHLY_REPORT,
		params: { period },
	});

const getMonthlyReportDetails = (period: string) =>
	apiClient.get<MonthlyReportDetailsResponse>({
		url: REPORT_API.MONTHLY_REPORT_DETAILS,
		params: { period },
	});

const getCashTransactionReport = (from: string, to: string) =>
	apiClient.get<CashTransactionReportResponse>({
		url: REPORT_API.CASH_TRANSACTION_REPORT,
		params: { from, to },
	});

const getCustomerTransactionDetailReport = (from: string, to: string) =>
	apiClient.get<CustomerTransactionDetailGroup[]>({
		url: REPORT_API.CUSTOMER_TRANSACTION_DETAIL_REPORT,
		params: { from, to },
	});

const getOpenInvoiceReport = (from: string, to: string) =>
	apiClient.get<OpenInvoiceCustomerGroup[]>({
		url: REPORT_API.OPEN_INVOICE_REPORT,
		params: { from, to },
	});

export default {
	getDailyReport,
	getInventoryStockReport,
	getMonthlyReport,
	getMonthlyReportDetails,
	getCashTransactionReport,
	getCustomerTransactionDetailReport,
	getOpenInvoiceReport,
};
