import { GetIt } from "@service-locator";
import {
	DailyIncomeAccountingApiImpl,
	DailyIncomePosApiImpl,
	DashboardApiImpl,
} from "./core/api/services/dashboardService";
import { type AuthRepository, AuthRepositoryImpl } from "./core/domain/auth/repositories";
import {
	type CustomerInfoRepository,
	CustomerInfoRepositoryImpl,
} from "./core/domain/dashboard/repositories/customer-info-repository";
import {
	type DailyIncomeAccountingRepository,
	DailyIncomeAccountingRepositoryImpl,
} from "./core/domain/dashboard/repositories/daily-income-accounting-repository";
import {
	type DailyIncomePosRepository,
	DailyIncomePosRepositoryImpl,
} from "./core/domain/dashboard/repositories/daily-income-pos-repository";
import {
	type DashboardRepository,
	DashboardRepositoryImpl,
} from "./core/domain/dashboard/repositories/dashboard-repository";
import {
	type PerformanceRepository,
	PerformanceRepositoryImpl,
} from "./core/domain/dashboard/repositories/performance-repository";
import { AppAuthService } from "./core/services/auth";
import {
	SaleFilterRepository,
	SaleFilterRepositoryImpl,
} from "./core/domain/sales/repositories/sale-filter-repository";
import {
	SaleProductRepository,
	SaleProductRepositoryImpl,
} from "./core/domain/sales/repositories/sale-product-repository";
import { SaleApiImpl } from "./core/api/services/saleService";
import { InitAble, isInitAble } from "./core/interfaces/init-able";
import { DisposeAble, isDisposeAble } from "./core/interfaces/dispose-able";
import { SaleCartRepository, SaleCartRepositoryImpl } from "./core/domain/sales/repositories/sale-cart-repository";

class Repository {
	private constructor() {}

	private static _instance: Repository = new Repository();

	private _getIt: GetIt = GetIt.instance;
	private _repositoryInstanceNames: Map<any, Set<string>> = new Map();

	/**
	 * Register repository as lazy singleton.
	 */
	static register<T extends object>(repository: T, options?: { instanceName?: string }): void {
		const instanceName = options?.instanceName;
		const registrationType = repository.constructor;

		Repository._instance._getIt.registerLazySingleton<T>(
			() => {
				if (isInitAble(repository)) {
					const res = (repository as InitAble).initialize();
					if (res instanceof Promise) res.catch(() => {});
				}
				return repository;
			},
			{
				instanceName,
				registrationType,
				dispose: async (repo: T) => {
					if (isDisposeAble(repo)) {
						const res = (repo as DisposeAble).dispose();
						if (res instanceof Promise) await res;
					}
				},
			},
		);

		Repository._instance._addInstanceName(registrationType, instanceName ?? "");
	}

	/** Initialize defaults via repositoryRegister(). */
	static initialize(): void {
		Repository._instance.repositoryRegister();
	}

	/** Get instance by runtime type and optional instanceName. */
	static get<T extends object>(type: { new (...args: any[]): T }, opts?: { instanceName?: string }): T {
		return Repository._instance._getIt.get<T>({ type, instanceName: opts?.instanceName });
	}

	/** Get or null by runtime type. */
	static getOrNull<T extends object>(type: { new (...args: any[]): T }, opts?: { instanceName?: string }): T | null {
		if (Repository._instance._getIt.isRegistered<T>({ type, instanceName: opts?.instanceName })) {
			return Repository._instance._getIt.get<T>({ type, instanceName: opts?.instanceName });
		}
		return null;
	}

	/**
	 * Get all instances for a given runtime type.
	 * Note: TS cannot infer generic T at runtime, so pass the constructor.
	 */
	static getAll<T extends object>(type: { new (...args: any[]): T }): T[] {
		const names = Repository._instance._repositoryInstanceNames.get(type) ?? new Set<string>();
		const result: T[] = [];
		for (const name of names) {
			const val = Repository.get<T>(type, { instanceName: name || undefined });
			if (val) result.push(val);
		}
		return result;
	}

	/** Reset and re-register defaults. */
	static async reset(): Promise<void> {
		await Repository._instance._getIt.reset();
		Repository._instance.repositoryRegister();
	}

	private _addInstanceName(type: any, instanceName: string): void {
		const set = this._repositoryInstanceNames.get(type) ?? new Set<string>();
		set.add(instanceName);
		this._repositoryInstanceNames.set(type, set);
	}

	repositoryRegister(): void {
		// Auth Repository
		Repository.register<AuthRepository>(new AuthRepositoryImpl(AppAuthService.getInstance()));

		// Dashboard - Income POS
		Repository.register<DashboardRepository>(
			new DashboardRepositoryImpl(new DashboardApiImpl(), "dashboard:selectedFilter:income-pos"),
			{ instanceName: "Dashboard-Income-Pos" },
		);

		// Dashboard - Income Accounting
		Repository.register<DashboardRepository>(
			new DashboardRepositoryImpl(new DashboardApiImpl(), "dashboard:selectedFilter:income-accounting"),
			{ instanceName: "Dashboard-Income-Accounting" },
		);

		// Daily Income POS
		Repository.register<DailyIncomePosRepository>(new DailyIncomePosRepositoryImpl(new DailyIncomePosApiImpl()));

		// Daily Income Accounting
		Repository.register<DailyIncomeAccountingRepository>(
			new DailyIncomeAccountingRepositoryImpl(new DailyIncomeAccountingApiImpl()),
		);

		// Customer Info
		Repository.register<CustomerInfoRepository>(new CustomerInfoRepositoryImpl(new DashboardApiImpl()));

		// Performance
		Repository.register<PerformanceRepository>(new PerformanceRepositoryImpl(new DashboardApiImpl()));

		// Sale Filter
		Repository.register<SaleFilterRepository>(new SaleFilterRepositoryImpl(new SaleApiImpl()));

		// Sale Product
		Repository.register<SaleProductRepository>(new SaleProductRepositoryImpl(new SaleApiImpl()));

		// Sale Cart
		Repository.register<SaleCartRepository>(new SaleCartRepositoryImpl());
	}
}

export default Repository;
export { Repository };
