/**
 * --------------------------------------------
 * @description Service Locator pattern with optimized caching for web
 * @license MIT
 * --------------------------------------------
 */

import {
	DailyIncomeAccountingApiImpl,
	DailyIncomePosApiImpl,
	DashboardApiImpl,
} from "./core/api/services/dashboardService";
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
import {
	type VendorInfoRepository,
	VendorInfoRepositoryImpl,
} from "./core/domain/dashboard/repositories/vendor-info-repository";
import type { DisposeAble } from "./core/types/dispose-able";
import type { InitAble } from "./core/types/init-able";

/* eslint-disable no-unused-vars */

/**
 * Repository (Service Locator)
 * ====================================================
 *
 * Provides dependency injection container with:
 * - Singleton pattern
 * - Type-safe service registration
 * - Optimized caching for web
 * - Lifecycle management (init/dispose)
 * - Multiple instances support via instanceName
 *
 * @example
 * ```typescript
 * // Register services
 * Repository.register<UserService>(new UserServiceImpl())
 *
 * // Get service
 * const userService = Repository.get<UserService>()
 *
 * // Get with instance name
 * const userService2 = Repository.get<UserService>('admin')
 *
 * // Get all instances of a type
 * const allUserServices = Repository.getAll<UserService>()
 *
 * // Reset all
 * await Repository.reset()
 * ```
 */
class Repository {
	private static _instance: Repository | null = null;
	private _cache = new Map<string, unknown>();
	private _instanceNames = new Map<string, Set<string>>();
	private _factories = new Map<string, () => unknown>();
	private _disposers = new Map<string, (disposeAble: DisposeAble) => void | Promise<void>>();

	private constructor() {
		// Private constructor for singleton
	}

	/**
	 * Get singleton instance
	 */
	private static get instance(): Repository {
		if (!Repository._instance) {
			Repository._instance = new Repository();
		}
		return Repository._instance;
	}

	/**
	 * Register a service instance
	 *
	 * @template T - Service type
	 * @param repository - Service instance
	 * @param options - Registration options
	 *
	 * @example
	 * ```typescript
	 * Repository.register<UserService>(new UserServiceImpl())
	 * Repository.register<UserService>(new AdminUserServiceImpl(), { instanceName: 'admin' })
	 * ```
	 */
	static register<T extends object>(repository: T, options?: { instanceName?: string }): void {
		const instanceName = options?.instanceName ?? "";
		const key = Repository._getKey(repository, instanceName);

		const instance = Repository.instance;

		// Store factory (lazy initialization)
		instance._factories.set(key, () => repository);

		// Store disposer if repository is DisposeAble
		if (Repository._isDisposeAble(repository)) {
			instance._disposers.set(key, (repo) => {
				return repo.dispose();
			});
		}

		// Initialize if needed
		if (Repository._isInitAble(repository)) {
			const initResult = repository.initialize();

			// Handle async initialization
			if (initResult instanceof Promise) {
				initResult.catch((error) => {
					console.error(`[Repository] Initialization failed for ${key}:`, error);
				});
			}
		}

		// Cache the instance
		instance._cache.set(key, repository);

		// Track instance names
		instance._addInstanceName(repository, instanceName);
	}

	/**
	 * Register a lazy factory
	 *
	 * Auto-detects dispose when service is created if it implements DisposeAble.
	 *
	 * @template T - Service type
	 * @param factory - Factory function that creates the service
	 * @param typeName - Type name for registration (required)
	 * @param options - Registration options
	 *
	 * @example
	 * ```typescript
	 * // Basic usage
	 * Repository.registerLazy(() => new UserServiceImpl(), 'UserServiceImpl')
	 *
	 * // With instance name
	 * Repository.registerLazy(() => new UserServiceImpl(), 'UserServiceImpl', { instanceName: 'admin' })
	 *
	 * // With custom dispose
	 * Repository.registerLazy(() => new UserServiceImpl(), 'UserServiceImpl', {
	 *   dispose: async (service) => await service.cleanup()
	 * })
	 * ```
	 */
	static registerLazy<T extends object>(
		factory: () => T,
		typeName: string,
		options?: {
			instanceName?: string;
			dispose?: (disposeAble: DisposeAble) => void | Promise<void>;
		},
	): void {
		const instanceName = options?.instanceName ?? "";
		const key = Repository._getKeyFromTypeName(typeName, instanceName);
		const instance = Repository.instance;

		// Store factory
		instance._factories.set(key, factory);

		// Store disposer if provided, otherwise will auto-detect when service is created
		if (options?.dispose) {
			instance._disposers.set(key, options.dispose);
		}

		// Track instance names
		instance._addInstanceNameFromTypeName(typeName, instanceName);
	}

	/**
	 * Get service instance
	 *
	 * Searches directly in cache/factories by instanceName or finds default instance.
	 *
	 * @template T - Service type
	 * @param instanceName - Optional instance name
	 * @returns Service instance
	 * @throws Error if service is not registered
	 *
	 * @example
	 * ```typescript
	 * // Get default instance (if only one registered)
	 * const userService = Repository.get<UserService>()
	 *
	 * // Get by instanceName
	 * const adminService = Repository.get<UserService>('admin')
	 * ```
	 */
	static get<T extends object>(instanceName?: string): T {
		if (!instanceName) {
			throw new Error("[Repository] instanceName is required. Please provide instanceName.");
		}

		const repoInstance = Repository.instance;
		const key = Repository._findKey(instanceName);

		if (!key) {
			throw new Error(`[Repository] Service with instanceName "${instanceName}" is not registered.`);
		}

		// Check cache first
		if (repoInstance._cache.has(key)) {
			return repoInstance._cache.get(key) as T;
		}

		// Lazy initialization
		const factory = repoInstance._factories.get(key);
		if (factory) {
			const service = factory() as T;

			if (Repository._isDisposeAble(service) && !repoInstance._disposers.has(key)) {
				repoInstance._disposers.set(key, (disposable: DisposeAble) => {
					return disposable.dispose();
				});
			}

			repoInstance._cache.set(key, service);
			return service;
		}

		throw new Error(
			`[Repository] Service ${key} is not registered. Use Repository.register() or Repository.registerLazy() first.`,
		);
	}

	/**
	 * Get service instance or null if not registered
	 *
	 * @template T - Service type
	 * @param instanceName - Optional instance name
	 * @returns Service instance or null
	 *
	 * @example
	 * ```typescript
	 * const userService = Repository.getOrNull<UserService>()
	 * const adminService = Repository.getOrNull<UserService>('admin')
	 * if (userService) {
	 *   // Use service
	 * }
	 * ```
	 */
	static getOrNull<T extends object>(instanceName?: string): T | null {
		try {
			return Repository.get<T>(instanceName);
		} catch {
			return null;
		}
	}

	/**
	 * Get all registered instances
	 *
	 * Returns all registered services (all types and instances)
	 *
	 * @template T - Service type
	 * @returns Array of all instances
	 *
	 * @example
	 * ```typescript
	 * const allServices = Repository.getAll()
	 * ```
	 */
	static getAll<T extends object>(): T[] {
		const repoInstance = Repository.instance;
		const services: T[] = [];

		// Get all cached services
		for (const service of repoInstance._cache.values()) {
			services.push(service as T);
		}

		return services;
	}

	/**
	 * Find key in cache/factories by instanceName or default
	 *
	 * Rules:
	 * - If instanceName provided → find exact match
	 * - If no instanceName and only 1 service → return it
	 * - If no instanceName and multiple services → throw error (require instanceName)
	 *
	 * @param instanceName - Optional instance name
	 * @returns Key if found, null otherwise
	 */
	private static _findKey(instanceName?: string): string | null {
		if (!instanceName) return null;

		const repoInstance = Repository.instance;

		for (const key of repoInstance._cache.keys()) {
			if (key.endsWith(`:${instanceName}`)) {
				return key;
			}
		}

		for (const key of repoInstance._factories.keys()) {
			if (key.endsWith(`:${instanceName}`)) {
				return key;
			}
		}

		return null;
	}

	/**
	 * Check if service is registered
	 *
	 * @template T - Service type
	 * @param instanceName - Optional instance name
	 * @returns True if service is registered
	 *
	 * @example
	 * ```typescript
	 * if (Repository.isRegistered()) {
	 *   // Check if default service exists
	 * }
	 *
	 * if (Repository.isRegistered('admin')) {
	 *   // Check if service with instanceName 'admin' exists
	 * }
	 * ```
	 */
	static isRegistered(instanceName: string): boolean {
		const key = Repository._findKey(instanceName);
		return key !== null;
	}

	/**
	 * Reset all registered services
	 *
	 * Disposes all DisposeAble services and clears cache
	 *
	 * @example
	 * ```typescript
	 * await Repository.reset()
	 * ```
	 */
	static async reset(): Promise<void> {
		const instance = Repository.instance;

		// Dispose all services
		const disposePromises: Promise<void>[] = [];

		for (const [key, service] of instance._cache.entries()) {
			const disposer = instance._disposers.get(key);
			if (disposer && Repository._isDisposeAble(service)) {
				const result = disposer(service as DisposeAble);
				if (result instanceof Promise) {
					disposePromises.push(result);
				}
			}
		}

		// Wait for all disposals to complete
		await Promise.all(disposePromises);

		// Clear everything
		instance._cache.clear();
		instance._factories.clear();
		instance._disposers.clear();
		instance._instanceNames.clear();
	}

	/**
	 * Clear cache but keep factories
	 *
	 * Useful for memory optimization without re-registering services
	 */
	static clearCache(): void {
		const instance = Repository.instance;

		// Dispose cached services
		for (const [key, service] of instance._cache.entries()) {
			const disposer = instance._disposers.get(key);
			if (disposer && Repository._isDisposeAble(service)) {
				const result = disposer(service);
				if (result instanceof Promise) {
					result.catch((error) => {
						console.error(`[Repository] Disposal failed for ${key}:`, error);
					});
				}
			}
		}

		instance._cache.clear();
	}

	/**
	 * Get cache statistics (for debugging)
	 */
	static getStats(): { cached: number; factories: number; types: number } {
		const instance = Repository.instance;
		return {
			cached: instance._cache.size,
			factories: instance._factories.size,
			types: instance._instanceNames.size,
		};
	}

	/**
	 * Track instance names
	 */
	private _addInstanceName(instance: object, instanceName: string): void {
		const typeName = Repository._getTypeNameFromInstance(instance);
		this._addInstanceNameFromTypeName(typeName, instanceName);
	}

	/**
	 * Track instance names from type name
	 */
	private _addInstanceNameFromTypeName(typeName: string, instanceName: string): void {
		const names = this._instanceNames.get(typeName);
		if (names) {
			names.add(instanceName);
		} else {
			this._instanceNames.set(typeName, new Set([instanceName]));
		}
	}

	/**
	 * Generate cache key from instance
	 */
	private static _getKey(instance: object, instanceName: string): string {
		const typeName = Repository._getTypeNameFromInstance(instance);
		return Repository._getKeyFromTypeName(typeName, instanceName);
	}

	/**
	 * Generate cache key from type name
	 */
	private static _getKeyFromTypeName(typeName: string, instanceName: string): string {
		return instanceName ? `${typeName}:${instanceName}` : typeName;
	}

	/**
	 * Get type name from instance (using constructor name)
	 */
	private static _getTypeNameFromInstance<T>(instance?: T): string {
		if (!instance) {
			return "Unknown";
		}

		// Try to get constructor name
		const ctor = (instance as { constructor?: { name?: string } }).constructor;
		if (ctor?.name) {
			return ctor.name;
		}

		// Fallback: use object type
		return typeof instance;
	}

	/**
	 * Check if object is InitAble
	 */
	private static _isInitAble(obj: unknown): obj is InitAble {
		return (
			typeof obj === "object" &&
			obj !== null &&
			"initialize" in obj &&
			typeof (obj as InitAble).initialize === "function"
		);
	}

	/**
	 * Check if object is DisposeAble
	 */
	private static _isDisposeAble(obj: unknown): obj is DisposeAble {
		return (
			typeof obj === "object" && obj !== null && "dispose" in obj && typeof (obj as DisposeAble).dispose === "function"
		);
	}
}

/**
 * Register all services
 *
 * This function should be called before adminlte.ts is loaded
 * to ensure all services are registered and ready to use.
 *
 * @example
 * ```typescript
 * // Register your services here
 * Repository.register<WeatherRepository>(
 *   new WeatherRepositoryImpl(
 *     new WeatherApiImpl()
 *   )
 * )
 *
 * Repository.register<ImageRepository>(
 *   new ImageRepositoryImpl(
 *     new ImageApiImpl()
 *   )
 * )
 * ```
 */
function repositoryRegister(): void {
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
	Repository.register<DailyIncomePosRepository>(new DailyIncomePosRepositoryImpl(new DailyIncomePosApiImpl()), {
		instanceName: "Daily-Income-Pos",
	});

	// Daily Income Accounting
	Repository.register<DailyIncomeAccountingRepository>(
		new DailyIncomeAccountingRepositoryImpl(new DailyIncomeAccountingApiImpl()),
		{ instanceName: "Daily-Income-Accounting" },
	);

	// Customer Info
	Repository.register<CustomerInfoRepository>(new CustomerInfoRepositoryImpl(new DashboardApiImpl()), {
		instanceName: "Customer-Info",
	});

	// Vendor Info
	Repository.register<VendorInfoRepository>(new VendorInfoRepositoryImpl(new DashboardApiImpl()), {
		instanceName: "Vendor-Info",
	});

	// Performance
	Repository.register<PerformanceRepository>(new PerformanceRepositoryImpl(new DashboardApiImpl()), {
		instanceName: "Performance",
	});
}

// Register services automatically
repositoryRegister();

export default Repository;
export { repositoryRegister };
