import { useQuery } from "@tanstack/react-query";
import reportService from "@/core/api/services/report-service";
import type { ReportDefinition } from "../report-types";
import { combineQueryStates } from "./report-query-utils";

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

	const queryState = combineQueryStates(
		dailyReportQuery,
		inventoryStockReportQuery,
		monthlyReportQuery,
		monthlyReportDetailsQuery,
		cashTransactionQuery,
		openInvoiceReportQuery,
	);

	return {
		dailyReport: queryState.isError ? undefined : dailyReportQuery.data,
		inventoryStockReport: queryState.isError ? undefined : inventoryStockReportQuery.data,
		monthlyReport: queryState.isError ? undefined : monthlyReportQuery.data,
		monthlyReportDetails: queryState.isError ? undefined : monthlyReportDetailsQuery.data,
		cashTransactionReport: queryState.isError ? undefined : cashTransactionQuery.data,
		openInvoiceReport: queryState.isError ? undefined : openInvoiceReportQuery.data,
		isLoading: queryState.isLoading,
		isError: queryState.isError,
		refetch: queryState.refetch,
	};
}
