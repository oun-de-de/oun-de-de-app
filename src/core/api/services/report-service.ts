import type {
	DailyReportResponse,
	InventoryStockReportLine,
	MonthlyReportDetailsResponse,
	MonthlyReportResponse,
} from "@/core/types/report";
import { apiClient } from "../apiClient";

enum REPORT_API {
	DAILY_REPORT = "/reports/daily-report",
	INVENTORY_STOCK_REPORT = "/reports/inventory-stock-report",
	MONTHLY_REPORT = "/reports/monthly-report",
	MONTHLY_REPORT_DETAILS = "/reports/monthly-report-details",
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

export default {
	getDailyReport,
	getInventoryStockReport,
	getMonthlyReport,
	getMonthlyReportDetails,
};
