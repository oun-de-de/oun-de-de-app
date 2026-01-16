import { DashboardRepositoryImpl } from "../../../core/domain/dashboard/repositories/dashboard-repository";
import {
	DailyIncomeAccountingApiImpl,
	DailyIncomePosApiImpl,
	DashboardApiImpl,
} from "../../../core/api/services/dashboardService";
import { registerProvider } from "../../../core/ui/multi-provider";
import { DailyIncomePosRepositoryImpl } from "../../../core/domain/dashboard/repositories/daily-income-pos-repository";
import { DailyIncomeAccountingRepositoryImpl } from "../../../core/domain/dashboard/repositories/daily-income-accounting-repository";
import { CustomerInfoRepositoryImpl } from "../../../core/domain/dashboard/repositories/customer-info-repository";
import { PerformanceRepositoryImpl } from "../../../core/domain/dashboard/repositories/performance-repository";

export function dashboardProviders() {
	return [
		registerProvider(
			() => new DashboardRepositoryImpl(new DashboardApiImpl(), "dashboard:selectedFilter:income-pos"),
			"Dashboard-Income-Pos",
		),

		registerProvider(
			() => new DashboardRepositoryImpl(new DashboardApiImpl(), "dashboard:selectedFilter:income-accounting"),
			"Dashboard-Income-Accounting",
		),

		registerProvider(() => new DailyIncomePosRepositoryImpl(new DailyIncomePosApiImpl())),
		registerProvider(() => new DailyIncomeAccountingRepositoryImpl(new DailyIncomeAccountingApiImpl())),
		registerProvider(() => new CustomerInfoRepositoryImpl(new DashboardApiImpl())),
		registerProvider(() => new PerformanceRepositoryImpl(new DashboardApiImpl())),
	];
}
