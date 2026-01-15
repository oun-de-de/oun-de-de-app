import { DailyIncomePoint } from "@/pages/dashboard/_dashboard/domain/entities/daily-income-point";
import apiClient from "../apiClient";
import { CustomerSummaryItem } from "@/pages/dashboard/_dashboard/domain/entities/customer-info";
import { PerformanceItem } from "@/pages/dashboard/_dashboard/domain/entities/performance";
import { FilterData } from "@/pages/dashboard/_dashboard/domain/entities/filter";

export enum DashboardApi {
  DailyIncomePos = "/dashboard/daily-income-pos",
  CustomerInfo = "/dashboard/customer-info",
  Performance = "/dashboard/performance",
  Filters = "/dashboard/filters",
}

const getDailyIncomePos = (range: string) =>
  apiClient.get<DailyIncomePoint[]>({
    url: DashboardApi.DailyIncomePos,
    params: { range },
  });

const getCustomerInfo = () =>
  apiClient.get<CustomerSummaryItem[]>({
    url: DashboardApi.CustomerInfo,
  });

const getPerformance = () =>
  apiClient.get<PerformanceItem[]>({
    url: DashboardApi.Performance,
  });

const getFiltersByType = (type: string) =>
  apiClient.get<FilterData[]>({
    url: DashboardApi.Filters,
    params: { type },
  });

export default {
  getDailyIncomePos,
  getCustomerInfo,
  getPerformance,
  getFiltersByType,
};

