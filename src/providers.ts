
import { DashboardRepository, DashboardRepositoryImpl } from "./core/domain/dashboard/repositories/dashboard-repository";
import { DashboardApiImpl } from "./core/api/services/dashboardService";
import { registerProvider } from "./core/ui/multi-provider";

export function providers() {
    return [
        registerProvider<DashboardRepository>(() =>
            new DashboardRepositoryImpl(new DashboardApiImpl(), "dashboard:selectedFilter:income-pos"),
            "Income-Pos"
        ),
        registerProvider<DashboardRepository>(() =>
            new DashboardRepositoryImpl(new DashboardApiImpl(), "dashboard:selectedFilter:income-accounting"),
            "Income-Accounting"
        ),
    ];
  }