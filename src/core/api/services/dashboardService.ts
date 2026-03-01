import type { CustomerSummaryItem } from "@/core/domain/dashboard/entities/customer-info";
import type { DailyIncomeAccounting, DailyIncomePos } from "@/core/domain/dashboard/entities/daily-income";
import type { FilterData } from "@/core/domain/dashboard/entities/filter";
import type { PerformanceItem } from "@/core/domain/dashboard/entities/performance";
import type { VendorSummaryItem } from "@/core/domain/dashboard/entities/vendor-info";
import { formatDisplayDate, formatKHR } from "@/core/utils/formatters";
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
	overdueLoanInstallments: number;
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

const mapPerformanceToCards = (response: GetPerformanceResponse): PerformanceItem[] => [
	{ id: "income", label: "Income", value: formatKHR(response.income), variant: "info" },
	{ id: "expenses", label: "Expenses", value: formatKHR(response.expenses), variant: "warning" },
	{
		id: "net-income",
		label: "Net Income",
		value: formatKHR(response.income - response.expenses),
		variant: response.income >= response.expenses ? "success" : "destructive",
	},
];

const mapFinancialOverviewToCards = (response: FinancialOverviewResponse): CustomerSummaryItem[] => [
	{
		id: "invoice-amount",
		label: "Invoice Amount",
		value: formatKHR(response.invoiceAmount),
		variant: "warning",
		icon: "solar:bill-list-bold",
	},
	{
		id: "overdue-cycles",
		label: "Overdue Cycles",
		value: response.overdueCycles,
		variant: "destructive",
		icon: "solar:danger-triangle-bold",
	},
	{
		id: "overdue-installments",
		label: "Overdue Installments",
		value: response.overdueLoanInstallments,
		variant: "info",
		icon: "solar:clock-circle-bold",
	},
	{
		id: "deposit-balance",
		label: "Deposit Balance",
		value: formatKHR(response.depositBalance),
		variant: "success",
		icon: "solar:dollar-bold",
	},
];

const mapDailyReport = (response: DailyReportResponse[]): DailyIncomeAccounting[] =>
	response.map((item) => ({
		date: formatDisplayDate(item.date, item.date),
		income: item.income,
		expense: item.expense,
	}));

const mapDailyReportToDailyIncomePos = (response: DailyReportResponse[]): DailyIncomePos[] =>
	response.map((item) => ({
		date: formatDisplayDate(item.date, item.date),
		amount: item.income,
	}));

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
		return mapFinancialOverviewToCards(response);
	}

	async getVendorInfo(): Promise<VendorSummaryItem[]> {
		const response = await apiClient.get<VendorSummaryItem[]>({
			url: "/dashboard/vendor-info",
		});
		return response;
	}

	async getPerformance(): Promise<PerformanceItem[]> {
		const response = await apiClient.get<GetPerformanceResponse>({
			url: DashboardApiPath.Performance,
		});
		return mapPerformanceToCards(response);
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
		return mapDailyReportToDailyIncomePos(response);
	}
}

export class DailyIncomeAccountingApiImpl implements DailyIncomeAccountingApi {
	async getDailyIncomesAccounting(range: string): Promise<DailyIncomeAccounting[]> {
		const response = await apiClient.get<DailyReportResponse[]>({
			url: DashboardApiPath.DailyReport,
			params: { range },
		});
		return mapDailyReport(response);
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
		const mock: CustomerSummaryItem[] = [
			{ id: "deposit", label: "Deposit Balance", value: "0 ₺", variant: "info", icon: "solar:dollar-bold" },
			{
				id: "sale-order",
				label: "Sale Order",
				value: "0 ₺",
				variant: "success",
				icon: "solar:users-group-rounded-bold",
			},
			{ id: "invoice", label: "Invoice", value: "398,631,700 ₺", variant: "warning", icon: "solar:bill-list-bold" },
			{ id: "overdue", label: "Overdue", value: "0 ₺", variant: "destructive", icon: "solar:bill-cross-bold" },
		];
		return Promise.resolve(mock);
	}

	async getVendorInfo(): Promise<VendorSummaryItem[]> {
		// Simple mock: empty vendor summary list
		return Promise.resolve([] as VendorSummaryItem[]);
	}

	async getPerformance(): Promise<PerformanceItem[]> {
		const mock: PerformanceItem[] = [
			{ id: "income", label: "Income", value: "255,180,200 ₺", variant: "info" },
			{ id: "expenses", label: "Expenses", value: "39,366,200 ₺", variant: "warning" },
			{ id: "net-income", label: "Net Income", value: "215,814,000 ₺", variant: "success" },
		];
		return Promise.resolve(mock);
	}

	async getFiltersByType(_type: string): Promise<FilterData[]> {
		return Promise.resolve(DEFAULT_DASHBOARD_FILTERS);
	}
}

export class DailyIncomePosMockupImpl implements DailyIncomePosApi {
	async getDailyIncomesPos(range: string): Promise<DailyIncomePos[]> {
		let days = 30;
		if (range === "7") days = 7;
		if (range === "15") days = 15;
		return Promise.resolve(generateDailyIncomePos(days));
	}
}

export class DailyIncomeAccountingMockupImpl implements DailyIncomeAccountingApi {
	async getDailyIncomesAccounting(range: string): Promise<DailyIncomeAccounting[]> {
		let days = 30;
		if (range === "7") days = 7;
		if (range === "15") days = 15;
		return Promise.resolve(generateDailyIncomeAccounting(days));
	}
}
