import { DailyIncomePoint } from "@/pages/dashboard/_dashboard/domain/entities/daily-income-point";
import apiClient from "../apiClient";
import { CustomerSummaryItem } from "@/pages/dashboard/_dashboard/domain/entities/customer-info";
import { PerformanceItem } from "@/pages/dashboard/_dashboard/domain/entities/performance";

export enum DashboardApi {
  DailyIncomePos = "/dashboard/daily-income-pos",
  CustomerInfo = "/dashboard/customer-info",
  Performance = "/dashboard/performance",
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

export default {
  getDailyIncomePos,
  getCustomerInfo,
  getPerformance,
};

