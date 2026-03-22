import type { CustomerSummaryItem } from "@/core/domain/dashboard/entities/customer-info";
import type { DailyIncomeAccounting, DailyIncomePos } from "@/core/domain/dashboard/entities/daily-income";
import type { FilterData } from "@/core/domain/dashboard/entities/filter";
import type { PerformanceItem } from "@/core/domain/dashboard/entities/performance";
import type { VendorSummaryItem } from "@/core/domain/dashboard/entities/vendor-info";
import { apiClient } from "../apiClient";

enum DashboardApiPath {
	DailyReport = "/dashboard/daily-report",
	FinancialOverview = "/dashboard/financial-overview",
	Performance = "/dashboard/performance",
}

type GetPerformanceResponse = {
	income: number;
	expenses: number;
};

type FinancialOverviewResponse = {
	invoiceAmount: number;
	overdueCycles: number;
	dueLoanInstallments: number;
	depositBalance: number;
};

type DailyReportResponse = {
	date: string;
	income: number;
	expense: number;
};

const DEFAULT_DASHBOARD_FILTERS: FilterData[] = [
	{ id: "7", value: "Last 7 Days" },
	{ id: "15", value: "Last 15 Days" },
	{ id: "30", value: "Last 30 Days" },
];

function toCustomerSummaryItems(response: FinancialOverviewResponse): CustomerSummaryItem[] {
	return [
		{
			id: "invoice-amount",
			label: "Invoice Amount",
			value: response.invoiceAmount,
			variant: "warning",
			icon: "solar:bill-list-bold",
		},
		{
			id: "overdue-cycles",
			label: "Overdue Cycles",
			value: response.overdueCycles,
			variant: "info",
			icon: "solar:danger-triangle-bold",
		},
		{
			id: "due-loan-installments",
			label: "Due Loan Installments",
			value: response.dueLoanInstallments,
			variant: "destructive",
			icon: "solar:clock-circle-bold",
		},
		{
			id: "deposit-balance",
			label: "Deposit Balance",
			value: response.depositBalance,
			variant: "success",
			icon: "solar:dollar-bold",
		},
	];
}

function toPerformanceItems(response: GetPerformanceResponse): PerformanceItem[] {
	return [
		{ id: "income", label: "Income", value: response.income, variant: "info" },
		{ id: "expenses", label: "Expenses", value: response.expenses, variant: "warning" },
		{
			id: "net-income",
			label: "Net Income",
			value: response.income - response.expenses,
			variant: response.income >= response.expenses ? "success" : "destructive",
		},
	];
}

function toDailyIncomeAccountingItems(response: DailyReportResponse[]): DailyIncomeAccounting[] {
	return response.map((item) => ({
		date: item.date,
		income: item.income,
		expense: item.expense,
	}));
}

function toDailyIncomePosItems(response: DailyReportResponse[]): DailyIncomePos[] {
	return response.map((item) => ({
		date: item.date,
		amount: item.income,
	}));
}

function getMockRangeDays(range: string): number {
	if (range === "7") return 7;
	if (range === "15") return 15;
	return 30;
}

function createMockFinancialOverviewResponse(): FinancialOverviewResponse {
	return {
		invoiceAmount: 398_631_700,
		overdueCycles: 0,
		dueLoanInstallments: 0,
		depositBalance: 0,
	};
}

function createMockPerformanceResponse(): GetPerformanceResponse {
	return {
		income: 255_180_200,
		expenses: 39_366_200,
	};
}

export interface DailyIncomePosApi {
	getDailyIncomesPos(range: string): Promise<DailyIncomePos[]>;
}

export interface DailyIncomeAccountingApi {
	getDailyIncomesAccounting(range: string): Promise<DailyIncomeAccounting[]>;
}

export interface DashboardApi {
	getCustomerInfo(): Promise<CustomerSummaryItem[]>;
	getVendorInfo(): Promise<VendorSummaryItem[]>;
	getPerformance(): Promise<PerformanceItem[]>;
	getFiltersByType(type: string): Promise<FilterData[]>;
}

export class DashboardApiImpl implements DashboardApi {
	async getCustomerInfo(): Promise<CustomerSummaryItem[]> {
		const response = await apiClient.get<FinancialOverviewResponse>({
			url: DashboardApiPath.FinancialOverview,
		});
		return toCustomerSummaryItems(response);
	}

	async getVendorInfo(): Promise<VendorSummaryItem[]> {
		// Swagger does not expose a vendor summary endpoint yet.
		return [];
	}

	async getPerformance(): Promise<PerformanceItem[]> {
		const response = await apiClient.get<GetPerformanceResponse>({
			url: DashboardApiPath.Performance,
		});
		return toPerformanceItems(response);
	}

	async getFiltersByType(_type: string): Promise<FilterData[]> {
		return DEFAULT_DASHBOARD_FILTERS;
	}
}

export class DailyIncomePosApiImpl implements DailyIncomePosApi {
	async getDailyIncomesPos(range: string): Promise<DailyIncomePos[]> {
		const response = await apiClient.get<DailyReportResponse[]>({
			url: DashboardApiPath.DailyReport,
			params: { range },
		});
		return toDailyIncomePosItems(response);
	}
}

export class DailyIncomeAccountingApiImpl implements DailyIncomeAccountingApi {
	async getDailyIncomesAccounting(range: string): Promise<DailyIncomeAccounting[]> {
		const response = await apiClient.get<DailyReportResponse[]>({
			url: DashboardApiPath.DailyReport,
			params: { range },
		});
		return toDailyIncomeAccountingItems(response);
	}
}

// Mock implementations (useful for local dev / storybook)
function formatDateDDMMYYYY(d: Date): string {
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const yyyy = d.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
}

function generateDailyIncomePos(days: number): DailyIncomePos[] {
	const data: DailyIncomePos[] = [];
	const today = new Date();
	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const amount = Math.floor(Math.random() * (30_000_000 - 2_000_000 + 1)) + 2_000_000;
		data.push({ date: formatDateDDMMYYYY(date), amount });
	}
	return data;
}

function generateDailyIncomeAccounting(days: number): DailyIncomeAccounting[] {
	const data: DailyIncomeAccounting[] = [];
	const today = new Date();
	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const income = Math.floor(Math.random() * (25_000_000 - 5_000_000 + 1)) + 5_000_000;
		const expense = Math.floor(Math.random() * (15_000_000 - 1_000_000 + 1)) + 1_000_000;
		data.push({ date: formatDateDDMMYYYY(date), income, expense });
	}
	return data;
}

export class DashboardApiMockupImpl implements DashboardApi {
	async getCustomerInfo(): Promise<CustomerSummaryItem[]> {
		return Promise.resolve(toCustomerSummaryItems(createMockFinancialOverviewResponse()));
	}

	async getVendorInfo(): Promise<VendorSummaryItem[]> {
		// Simple mock: empty vendor summary list
		return Promise.resolve([] as VendorSummaryItem[]);
	}

	async getPerformance(): Promise<PerformanceItem[]> {
		return Promise.resolve(toPerformanceItems(createMockPerformanceResponse()));
	}

	async getFiltersByType(_type: string): Promise<FilterData[]> {
		return Promise.resolve(DEFAULT_DASHBOARD_FILTERS);
	}
}

export class DailyIncomePosMockupImpl implements DailyIncomePosApi {
	async getDailyIncomesPos(range: string): Promise<DailyIncomePos[]> {
		return Promise.resolve(generateDailyIncomePos(getMockRangeDays(range)));
	}
}

export class DailyIncomeAccountingMockupImpl implements DailyIncomeAccountingApi {
	async getDailyIncomesAccounting(range: string): Promise<DailyIncomeAccounting[]> {
		return Promise.resolve(generateDailyIncomeAccounting(getMockRangeDays(range)));
	}
}
