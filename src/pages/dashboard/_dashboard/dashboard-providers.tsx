import { ReactNode } from "react";
import { MultiStoreProvider, StoreConfig } from "@/core/ui/store/multi-store-provider";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { type CustomerInfoStore, createCustomerInfoStore } from "./stores/customer-info/customer-info-store";
import { type PerformanceStore, createPerformanceStore } from "./stores/performance/performance-store";
import {
	type DailyIncomeAccountingStore,
	createDailyIncomeAccountingStore,
} from "./stores/income-accounting/daily-income-accounting-store";
import { type DailyIncomePosStore, createDailyIncomePosStore } from "./stores/income-pos/daily-income-pos-store";
import { Repository } from "@/service-locator";
import {
	CustomerInfoRepository,
	CustomerInfoRepositoryImpl,
} from "@/core/domain/dashboard/repositories/customer-info-repository";
import {
	PerformanceRepository,
	PerformanceRepositoryImpl,
} from "@/core/domain/dashboard/repositories/performance-repository";
import {
	DailyIncomeAccountingRepository,
	DailyIncomeAccountingRepositoryImpl,
} from "@/core/domain/dashboard/repositories/daily-income-accounting-repository";
import {
	DailyIncomePosRepository,
	DailyIncomePosRepositoryImpl,
} from "@/core/domain/dashboard/repositories/daily-income-pos-repository";

const customerInfoBoundStore = createBoundStore<CustomerInfoStore>({
	createStore: () =>
		createCustomerInfoStore({
			customerRepo: Repository.get<CustomerInfoRepository>(CustomerInfoRepositoryImpl),
		}),
});

const performanceBoundStore = createBoundStore<PerformanceStore>({
	createStore: () =>
		createPerformanceStore({
			performanceRepo: Repository.get<PerformanceRepository>(PerformanceRepositoryImpl),
		}),
});

const dailyIncomeAccountingBoundStore = createBoundStore<DailyIncomeAccountingStore>({
	createStore: () =>
		createDailyIncomeAccountingStore({
			accountingRepo: Repository.get<DailyIncomeAccountingRepository>(DailyIncomeAccountingRepositoryImpl),
		}),
});

const dailyIncomePosStore = createBoundStore<DailyIncomePosStore>({
	createStore: () =>
		createDailyIncomePosStore({
			posRepo: Repository.get<DailyIncomePosRepository>(DailyIncomePosRepositoryImpl),
		}),
});

// Store configuration for MultiStoreProvider
const dashboardStores: StoreConfig[] = [
	{
		name: "customerInfo",
		store: customerInfoBoundStore,
	},
	{
		name: "performance",
		store: performanceBoundStore,
	},
	{
		name: "dailyIncomeAccounting",
		store: dailyIncomeAccountingBoundStore,
	},
	{
		name: "dailyIncomePos",
		store: dailyIncomePosStore,
	},
];

interface DashboardProvidersProps {
	children: ReactNode;
}

/**
 * DashboardProviders - Wraps all dashboard stores with MultiStoreProvider
 * Provides centralized store management for Dashboard page
 */
export function DashboardProviders({ children }: DashboardProvidersProps) {
	return <MultiStoreProvider stores={dashboardStores}>{children}</MultiStoreProvider>;
}
