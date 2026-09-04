import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import reportService from "@/core/api/services/report-service";
import { getReportDefinition } from "../report-specs";
import {
	isCashTransactionApiDataSource,
	isOpenInvoiceReportApiDataSource,
	isDailyReportApiDataSource,
	isInventoryStockReportApiDataSource,
	isMonthlyReportApiDataSource,
	isMonthlyReportDetailsApiDataSource,
} from "../report-types";
import { getReportDateContext } from "./report-data-utils";
import type { ReportFiltersValue } from "./report-filters";
import { useAccountingReportQuery } from "./useAccountingReportQuery";

vi.mock("@/core/api/services/report-service", () => ({
	default: {
		getDailyReport: vi.fn(),
		getInventoryStockReport: vi.fn(),
		getMonthlyReport: vi.fn(),
		getMonthlyReportDetails: vi.fn(),
		getCashTransactionReport: vi.fn(),
	},
}));

function renderAccountingQuery(slug: string, filters: ReportFiltersValue) {
	const definition = getReportDefinition(slug);
	const dataSource = definition.dataSource ?? "invoice-export";
	const dateContext = getReportDateContext(definition, filters);

	const rendered = renderHook(
		() =>
			useAccountingReportQuery({
				definition,
				hasRequiredDateFilters: dateContext.hasRequiredDateFilters,
				reportDate: dateContext.reportDate,
				reportPeriod: dateContext.reportPeriod,
				rangeDateFrom: dateContext.rangeDateFrom,
				rangeDateTo: dateContext.rangeDateTo,
				isDailyReportApi: isDailyReportApiDataSource(dataSource),
				isInventoryStockReportApi: isInventoryStockReportApiDataSource(dataSource),
				isMonthlyReportApi: isMonthlyReportApiDataSource(dataSource),
				isMonthlyReportDetailsApi: isMonthlyReportDetailsApiDataSource(dataSource),
				isCashTransactionApi: isCashTransactionApiDataSource(dataSource),
				isOpenInvoiceReportApi: isOpenInvoiceReportApiDataSource(dataSource),
			}),
		{ wrapper: createWrapper() },
	);

	return { ...rendered, dateContext };
}

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
	});
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe("cash transaction report query", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(reportService.getCashTransactionReport).mockResolvedValue({ initCashOnHand: 0, lines: [] });
	});

	it("fetches the exact date range the user picked, not the enclosing month", async () => {
		const filters = { fromDate: "2026-06-03", toDate: "2026-06-11", useDateRange: true } as ReportFiltersValue;
		const { result } = renderAccountingQuery("cash-transaction-report", filters);

		await waitFor(() => expect(result.current.cashTransactionReport).toBeDefined());

		expect(reportService.getCashTransactionReport).toHaveBeenCalledWith("2026-06-03", "2026-06-11");
		// The old wiring called getMonthlyReportDetails("2026-06"), collapsing the range to a month.
		expect(reportService.getMonthlyReportDetails).not.toHaveBeenCalled();
	});

	it("waits for both dates before firing", () => {
		const filters = { fromDate: "2026-06-03", toDate: "", useDateRange: true } as ReportFiltersValue;
		const { dateContext } = renderAccountingQuery("cash-transaction-report", filters);

		expect(dateContext.hasRequiredDateFilters).toBe(false);
		expect(reportService.getCashTransactionReport).not.toHaveBeenCalled();
	});
});
