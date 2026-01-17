import type { DailyIncomeAccounting, DailyIncomePos } from "@/core/domain/dashboard/entities/daily-income";
import apiClient from "../apiClient";
import type { CustomerSummaryItem } from "@/core/domain/dashboard/entities/customer-info";
import type { VendorSummaryItem } from "@/core/domain/dashboard/entities/vendor-info";
import type { PerformanceItem } from "@/core/domain/dashboard/entities/performance";
import type { FilterData } from "@/core/domain/dashboard/entities/filter";

enum DashboardApiPath {
	DailyIncomePos = "/dashboard/daily-income-pos",
	DailyIncomeAccounting = "/dashboard/daily-income-accounting",
	CustomerInfo = "/dashboard/customer-info",
	VendorInfo = "/dashboard/vendor-info",
	Performance = "/dashboard/performance",
	Filters = "/dashboard/filters",
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
	getCustomerInfo() {
		return apiClient.get<CustomerSummaryItem[]>({
			url: DashboardApiPath.CustomerInfo,
		});
	}

	getVendorInfo() {
		return apiClient.get<VendorSummaryItem[]>({
			url: DashboardApiPath.VendorInfo,
		});
	}

	getPerformance() {
		return apiClient.get<PerformanceItem[]>({
			url: DashboardApiPath.Performance,
		});
	}

	getFiltersByType(type: string) {
		return apiClient.get<FilterData[]>({
			url: DashboardApiPath.Filters,
			params: { type },
		});
	}
}

export class DailyIncomePosApiImpl implements DailyIncomePosApi {
	getDailyIncomesPos(range: string) {
		return apiClient.get<DailyIncomePos[]>({
			url: DashboardApiPath.DailyIncomePos,
			params: { range },
		});
	}
}

export class DailyIncomeAccountingApiImpl implements DailyIncomeAccountingApi {
	getDailyIncomesAccounting(range: string) {
		return apiClient.get<DailyIncomeAccounting[]>({
			url: DashboardApiPath.DailyIncomeAccounting,
			params: { range },
		});
	}
}
