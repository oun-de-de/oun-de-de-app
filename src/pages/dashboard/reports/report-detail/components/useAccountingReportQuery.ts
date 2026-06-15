import { useQuery } from "@tanstack/react-query";
import reportService from "@/core/api/services/report-service";
import type { ReportDefinition } from "../report-types";

interface UseAccountingReportQueryParams {
	definition: ReportDefinition;
	hasRequiredDateFilters: boolean;
	reportDate: string;
	reportPeriod: string;
	inventoryDateFrom: string;
	inventoryDateTo: string;
	isDailyReportApi: boolean;
	isInventoryStockReportApi: boolean;
	isMonthlyReportApi: boolean;
	isMonthlyReportDetailsApi: boolean;
}

export function useAccountingReportQuery({
	hasRequiredDateFilters,
	reportDate,
	reportPeriod,
	inventoryDateFrom,
	inventoryDateTo,
	isDailyReportApi,
	isInventoryStockReportApi,
	isMonthlyReportApi,
	isMonthlyReportDetailsApi,
}: UseAccountingReportQueryParams) {
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

	return {
		dailyReport: dailyReportQuery.data,
		inventoryStockReport: inventoryStockReportQuery.data,
		monthlyReport: monthlyReportQuery.data,
		monthlyReportDetails: monthlyReportDetailsQuery.data,
		isLoading:
			dailyReportQuery.isLoading ||
			inventoryStockReportQuery.isLoading ||
			monthlyReportQuery.isLoading ||
			monthlyReportDetailsQuery.isLoading,
	};
}
