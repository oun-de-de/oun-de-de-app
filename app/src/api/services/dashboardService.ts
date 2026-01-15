import { DailyIncomeAccounting, DailyIncomePos } from "@/pages/dashboard/_dashboard/domain/entities/daily-income";
import apiClient from "../apiClient";
import { CustomerSummaryItem } from "@/pages/dashboard/_dashboard/domain/entities/customer-info";
import { PerformanceItem } from "@/pages/dashboard/_dashboard/domain/entities/performance";
import { FilterData } from "@/pages/dashboard/_dashboard/domain/entities/filter";

enum DashboardApiPath {
  DailyIncomePos = "/dashboard/daily-income-pos",
  DailyIncomeAccounting = "/dashboard/daily-income-accounting",
  CustomerInfo = "/dashboard/customer-info",
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
  getPerformance(): Promise<PerformanceItem[]>;
  getFiltersByType(type: string): Promise<FilterData[]>;
}

export class DashboardApiImpl implements DashboardApi {
  getCustomerInfo() {
    return apiClient.get<CustomerSummaryItem[]>({
      url: DashboardApiPath.CustomerInfo,
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