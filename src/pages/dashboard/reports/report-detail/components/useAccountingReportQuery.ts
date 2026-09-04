import { useQuery } from "@tanstack/react-query";
import reportService from "@/core/api/services/report-service";
import type { ReportDefinition } from "../report-types";

interface UseAccountingReportQueryParams {
	definition: ReportDefinition;
	hasRequiredDateFilters: boolean;
	reportDate: string;
	reportPeriod: string;
	rangeDateFrom: string;
	rangeDateTo: string;
	isDailyReportApi: boolean;
	isInventoryStockReportApi: boolean;
	isMonthlyReportApi: boolean;
	isMonthlyReportDetailsApi: boolean;
	isCashTransactionApi: boolean;
	isOpenInvoiceReportApi: boolean;
}

export function useAccountingReportQuery({
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
	isOpenInvoiceReportApi,
}: UseAccountingReportQueryParams) {
	const dailyReportQuery = useQuery({
		queryKey: ["report", "daily-report", reportDate],
		queryFn: () => reportService.getDailyReport(reportDate),
		enabled: isDailyReportApi && hasRequiredDateFilters,
	});

	const inventoryStockReportQuery = useQuery({
		queryKey: ["report", "inventory-stock-report", rangeDateFrom, rangeDateTo],
		queryFn: () => reportService.getInventoryStockReport(rangeDateFrom, rangeDateTo),
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

	const cashTransactionQuery = useQuery({
		queryKey: ["report", "cash-transaction-report", rangeDateFrom, rangeDateTo],
		queryFn: () => reportService.getCashTransactionReport(rangeDateFrom, rangeDateTo),
		enabled: isCashTransactionApi && hasRequiredDateFilters,
	});

	const openInvoiceReportQuery = useQuery({
		queryKey: ["report", "open-invoice-report", rangeDateFrom, rangeDateTo],
		queryFn: () => reportService.getOpenInvoiceReport(rangeDateFrom, rangeDateTo),
		enabled: isOpenInvoiceReportApi && hasRequiredDateFilters,
	});

	return {
		dailyReport: dailyReportQuery.data,
		inventoryStockReport: inventoryStockReportQuery.data,
		monthlyReport: monthlyReportQuery.data,
		monthlyReportDetails: monthlyReportDetailsQuery.data,
		cashTransactionReport: cashTransactionQuery.data,
		openInvoiceReport: openInvoiceReportQuery.data,
		isLoading:
			dailyReportQuery.isLoading ||
			inventoryStockReportQuery.isLoading ||
			monthlyReportQuery.isLoading ||
			monthlyReportDetailsQuery.isLoading ||
			cashTransactionQuery.isLoading ||
			openInvoiceReportQuery.isLoading,
	};
}
